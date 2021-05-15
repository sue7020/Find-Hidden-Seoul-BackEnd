//클라에 database 뿌려주기
var express = require('express');
var mysql = require('mysql');
var jwt = require('jwt-simple');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();


router.post('/', function (req, res, next) {
    var rank;
    var token = req.body.token;

    //토큰을 request한경우
    if (token != null && token.length > 0) {

        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);
        console.log(' get_main_data >>> Decoded user index:' + decoded.user_index);

		//user_level로 정렬 (user_level이 같을 시 counts로 정렬)
        connection.query("SELECT * FROM (SELECT user_index, nick_name, IFNULL(counts, 0) as counts, user_level FROM (SELECT review_user_index, count(review_img) AS counts FROM futureHeritage.review GROUP BY review_user_index) S RIGHT OUTER JOIN futureHeritage.user U ON S.review_user_index = U.user_index, (SELECT @ROWNUM := 0) R ORDER BY user_level desc, counts DESC) D ;", function (err, cursor) {
            if (err != null)
                throw err;
            else {
                
                cursor[0].RANK = 1;
                //모든 사용자의 랭킹 계산
                for (var j = 0; j < cursor.length; j++) {
                    //console.log(j + ')))' + cursor[j].nick_name + '의 counts: ' + cursor[j].counts);

                    if (j + 1 >= cursor.length) {
                        if (cursor[j - 1].counts == cursor[j].counts)
                            cursor[j].RANK = cursor[j - 1].RANK;
                        else
                            cursor[j].RANK = cursor[j - 1].RANK + 1;
                        break;
                    }
                    else {
                        if (cursor[j].counts > cursor[j + 1].counts) {
                            cursor[j + 1].RANK = cursor[j].RANK + 1;
                        }
                        else if (cursor[j].counts == cursor[j + 1].counts)
                            cursor[j + 1].RANK = cursor[j].RANK;
                    }
                }

                //토큰에 따른 사용자 랭킹 구하기
                for (var i = 0; i < cursor.length; i++)
                {
                    if (cursor[i].user_index == decoded.user_index) { //요청한 사용자의 인덱스로 결과받아오기
                        rank = cursor[i].RANK;
                        //console.log(decoded.user_index + '의 랭킹은 : ' + rank);
                        break;
                    }
                }

                var level = cursor[i].user_level;
				
                //닉네임, 레벨, 캐릭터url JSON 형식으로 보내주기
                connection.query("SELECT ?? FROM ?? WHERE user_index  = ?;", ['nick_name', 'user', decoded.user_index], function (error, cursor) {
                    if (undefined !== cursor && cursor.length > 0) {

                        console.log(' get_main_data >>> ' + cursor[0].nick_name);
                        var nickname = cursor[0].nick_name;

                        connection.query("SELECT charURL FROM level_img WHERE level= ?;", [level], function (error, cursor) {
                            if (undefined !== cursor && cursor.length > 0) {

                                var char_url = cursor[0].charURL;
                                res.status(200).json({ nick_name: nickname, rank: rank, level: level, charURL: char_url });//JSON형식으로 묶기

                            }else
                                res.status(503).json(error);
                        });
                    }
                    else
                        res.status(503).json(error);
                });

        }//end of else
        
        });//end of SELECT COUNT connection

    }//end of token if

    else { //토큰을 request안한경우
        //토큰이 없음 로그인안한경우
        res.status(200).send();
    }

});




module.exports = router;



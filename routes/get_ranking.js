//(문연주)클라에 database 뿌려주기
var express = require('express');
var mysql = require('mysql');
var jwt = require('jwt-simple');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();

//전체Ranking
router.post('/', function (req, res, next) {

    var token = req.body.token;

    //토큰을 request한경우
    if (token != null && token.length > 0) { 

        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);
        console.log(' get_ranking >>> Decoded user index:' + decoded.user_index);

        connection.query("SELECT * FROM (SELECT user_index, nick_name, IFNULL(counts, 0) as counts, user_level as level FROM (SELECT review_user_index, count(review_img) AS counts FROM futureHeritage.review GROUP BY review_user_index) S RIGHT OUTER JOIN futureHeritage.user U ON S.review_user_index = U.user_index, (SELECT @ROWNUM := 0) R ORDER BY user_level desc, counts DESC) D ;", function (err, cursor) {
            if (err != null)
                throw err;

            //사용자 리뷰 갯수에 따른 레벨 정의
            else {

                cursor[0].RANK = 1;

                for (var j = 0; j < cursor.length; j++)
                {
                    console.log(j + ')))' + cursor[j].nick_name + '의 counts: ' + cursor[j].counts);

                    if (j + 1 >= cursor.length) {
                        if (cursor[j - 1].counts == cursor[j].counts)
                                cursor[j].RANK = cursor[j-1].RANK;
                         else 
                            cursor[j].RANK = cursor[j - 1].RANK +1;
                        break;
                    }
                    else {
                        if (cursor[j].counts > cursor[j + 1].counts) {
                            cursor[j + 1].RANK = cursor[j].RANK + 1;
                        }
                        else if (cursor[j].counts == cursor[j + 1].counts)
                            cursor[j + 1].RANK = cursor[j].RANK;
                    }

                    console.log(cursor[j].nick_name + '의 랭킹은: ' + cursor[j].RANK);
                }


                for (var i = 0; i < cursor.length; i++) {
                    //커서에 레벨, 레벨에따른 이미지url추가
                    cursor[i].level_imgUrl = "https://s3.ap-northeast-2.amazonaws.com/future-heritage/level/level_0" + cursor[i].level + ".png";

                }//end of for

                res.status(200).json(cursor);//JSON형식으로 묶기
                                    
            }//end of else

        });
    }//end of token if
    else { //토큰을 request안한경우
        //토큰이 없음 로그인안한경우
        res.status(200).json({ token: null });
    }


    

});





module.exports = router;
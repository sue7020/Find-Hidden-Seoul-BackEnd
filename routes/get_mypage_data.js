//(방유라) 클라에 database 뿌려주기
var express = require('express');
var mysql = require('mysql');
var jwt = require('jwt-simple');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();


router.post('/', function (req, res, next) {

    var token = req.body.token;

    if (token != null && token.length > 0) {

        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);
        console.log(' get_mypage_data >>> Decoded user index:' + decoded.user_index);

        connection.query("SELECT * FROM (SELECT @ROWNUM := @ROWNUM + 1 AS RANK, review_user_index, nick_name, counts FROM (SELECT review_user_index, count(review_content) AS counts FROM futureHeritage.review GROUP BY review_user_index) S  JOIN futureHeritage.user U ON S.review_user_index = U.user_index, (SELECT @ROWNUM := 0) R ORDER BY counts DESC) A WHERE review_user_index = ?;", [decoded.user_index], function (err, cursor) {
            if (err != null)
                throw err;
            else {
                console.log('사용자 리뷰 개수: ' + cursor[0].counts);
				console.log('사용자 리뷰 순위: ' + cursor[0].RANK);
				var rank = cursor[0].RANK;
                //사용자 리뷰 갯수에 따른 레벨 정의
                var review_count = cursor[0].counts;
                var level = 0;

                if (review_count == 0) {
                    level = 0;
                } else if (review_count < 5) {
                    level = 1;
                } else if (review_count < 10) {
                    level = 2;
                } else if (review_count < 19) {
                    level = 3;
                } else if (review_count < 30) {
                    level = 4;
                } else if (review_count < 41) {
                    level = 5;
                } else if (review_count < 53) {
                    level = 6;
                } else if (review_count < 66) {
                    level = 7;
                } else if (review_count < 79) {
                    level = 8;
                } else if (review_count < 91) {
                    level = 9;
                } else if (review_count < 101) {
                    level = 10;
                } else {
                    level = 11;//만랩
                }


                //토큰, 닉네임, 레벨, 캐릭터url(레벨 img) JSON 형식으로 보내주기
                connection.query("SELECT ?? FROM ?? WHERE user_index  = ?;", ['nick_name', 'user', decoded.user_index], function (error, cursor) {
                    if (undefined !== cursor && cursor.length > 0) {

                        console.log(' get_mypage_data >>> ' + cursor[0].nick_name);
                        var nickname = cursor[0].nick_name;

                        connection.query("SELECT charURL FROM level_img WHERE level= ?;", [level], function (error, cursor) {
                            if (undefined !== cursor && cursor.length > 0) {

                                var char_url = cursor[0].charURL;
                                res.status(200).json({ nick_name: nickname, rank: rank, level: level, charURL: char_url });//JSON형식으로 묶어 보내기

                            } else
                                res.status(503).json(error);
                        });
                    }
                    else //받은 토큰의 인덱스 사용자가 존재x
                        res.status(503).json(error); 
                });

            }//end of else

        });//end of SELECT COUNT connection

    }//end of token if


    else { //토큰을 request안한경우
        //토큰이 없음 로그인안한경우 mypage 접속x
        console.log('ERR! get_mypage_data >>> 토큰이 null 인경우');
        res.status(503).json(error);
    }

});

//내가 방문한 문화 유산 리뷰
router.post('/myreview_recent', function (req, res, next) {

    var token = req.body.token;

    if (token != null && token.length > 0) {

        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);
        console.log(' get_mypage_data/myreview_recent >>> Decoded user index:' + decoded.user_index);

        //토큰으로 받은 사용자 index로 내가 올린 리뷰이미지, 리뷰내용 보내주기
        connection.query("SELECT review_heritage_index, review_index, heritage_name ,review_img, review_content FROM review, heritage WHERE review.review_heritage_index=heritage.heritage_index AND review_user_index = ? ORDER BY review_date DESC LIMIT 2;", [decoded.user_index], function (error, cursor) {
            if (undefined !== cursor && cursor.length > 0) {

                res.json(cursor);
            }
            else
                res.status(200).send(null);
        });
       

    }//end of token if


    else { //토큰을 request안한경우
        res.status(503).json(error);
    }

});

//내가 방문한 문화 유산 더보기 (전체) 리뷰
router.post('/myreview', function (req, res, next) {

    var token = req.body.token;

    if (token != null && token.length > 0) {

        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);
        console.log(' get_mypage_data/myreview >>> Decoded user index:' + decoded.user_index);

        //토큰으로 받은 사용자 index로 내가 올린 리뷰이미지, 리뷰내용 보내주기
        connection.query("SELECT review_heritage_index, review_index, heritage_name ,review_img, review_content FROM review, heritage WHERE review.review_heritage_index=heritage.heritage_index AND review_user_index = ? ORDER BY review_date DESC;", [decoded.user_index], function (error, cursor) {
            if (undefined !== cursor && cursor.length > 0) {

                res.json(cursor);
            }
            else
                res.status(200).send(null);
        });


    }//end of token if


    else { //토큰을 request안한경우
        res.status(503).json(error);
    }

});

//내가 좋아요 누른 문화 유산
router.post('/mylike', function (req, res, next) {

    var token = req.body.token;

    if (token != null && token.length > 0) {

        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);
        console.log(' get_mypage_data/myreview_like >>> Decoded user index:' + decoded.user_index);

        //토큰으로 받은 사용자 index가 좋아요한 문화유산 이름, 사진 받아오기
        connection.query("SELECT heritage_index, heritage_mainImg, heritage_name, gu FROM heritage, heritage_like WHERE heritage.heritage_index = heritage_like.like_heritage_index AND like_user_index = ? ORDER BY like_index DESC LIMIT 2; ", [decoded.user_index], function (error, cursor) {
            if (undefined !== cursor && cursor.length > 0) {
                res.json(cursor);
            }
            else
                res.status(200).send(null);
        });
    }//end of token if

    else { //토큰을 request안한경우
        res.status(503).json(error);
    }

});


// 마이페이지 좋아요 누른 곳 더보기 보여주기
router.post('/more_liked', function (req, res, next) {

    var token = req.body.token;

    if (token != null && token.length > 0) {

        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);
        console.log(' get_mypage_data/more_liked >>> Decoded user index:' + decoded.user_index);


        connection.query("SELECT heritage_index, heritage_mainImg, heritage_name, gu FROM heritage, heritage_like WHERE heritage.heritage_index = heritage_like.like_heritage_index AND like_user_index = ? ORDER BY like_index DESC;", [decoded.user_index], function (error, cursor) {
            if (undefined !== cursor && cursor.length > 0) {          

                res.json(cursor);
            }
            else
                res.status(200).send(null);
        });
    }
});

module.exports = router;
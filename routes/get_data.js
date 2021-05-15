//클라에 database 뿌려주기
var express = require('express');
var mysql = require('mysql');
var jwt = require('jwt-simple');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();


//구에 따른 내용보내기 (요청 url 예시 http://13.124.144.195:3000/get_data/gu/?gu=강서구)
router.get('/gu', function (req, res, next) {
  
    console.log('요청된 지역: '+ req.query.gu); //클라이언트 요청 req의 query부분에서 gu 데이터만 추출

    connection.query("SELECT ??, ??, ??, ??, ??, ?? FROM ?? WHERE gu = ? ORDER BY ?? DESC;", ['heritage_index', 'heritage_name', 'gu', 'category', 'heritage_mainImg', 'likes', 'heritage', req.query.gu, 'likes'], function (error, cursor) {
          if(undefined !== cursor && cursor.length > 0) {
               res.json(cursor);
          }
          else
               res.status(503).json(error);
          });
});

//토큰의 사용자가 해당 heritage_index에 좋아요를 눌렀는지 여부 체크
router.post('/like_check', function (req, res, next) {
    var token = req.body.token;
    var heritage_index = req.body.heritage_index;

    if (token != null && token.length > 0) {

        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);

        connection.query("SELECT count(*) AS likes_num FROM ?? WHERE like_heritage_index = ? AND like_user_index = ?;", ['heritage_like', heritage_index, decoded.user_index], function (error, cursor) {
            if (undefined !== cursor && cursor.length > 0) {

                    var likes_num = cursor[0].likes_num;

                    if (likes_num == 1) //이미 해당 사용자가 그 문화유산에 대한 좋아요를 누름
                        res.status(200).json({ like_check: 'like' });

                    else  //해당 사용자가 그 문화유산에 대한 좋아요를 누르지 않음
                        res.status(200).json({ like_check: 'unlike' });
            }
            else { //DB query 결과 이상
                res.status(503).json(error);
            }
        });

    } else { //token 이상
        console.log('ERR! get_data/like_check >>> 토큰이 null 인경우');
        res.status(503).json(error);
    }
    

});

//좋아요 처리
router.post('/like', function (req, res, next) {

    var token = req.body.token;
    var heritage_index = req.body.heritage_index;

    if (token != null && token.length > 0) {

        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);
    
        //받은 인덱스의 사용자가 특정 유산에대한 좋아요를 눌렀는지 확인
        connection.query("SELECT count(*) as likes_num FROM ?? WHERE like_heritage_index = ? AND like_user_index = ?;", ['heritage_like', heritage_index, decoded.user_index], function (error, cursor) {
            if (undefined !== cursor && cursor.length > 0) { 

                var likes_num = cursor[0].likes_num;

                if (likes_num == 1) //이미 좋아요를 눌렀다면 좋아요를 취소한다.
                {
                    //해당 좋아요를 취소한다 (like 테이블에서 정보 delete)
                    connection.query("DELETE FROM ?? WHERE like_user_index = ? and like_heritage_index = ?;", ['heritage_like', decoded.user_index, heritage_index], function (error, info) {
                        if (error != null)
                            res.status(503).json(error);
                        else { // heritage table에서도 총 개수도 수정해준다.

                            connection.query('UPDATE heritage SET likes = likes-1 WHERE heritage_index = ?;', [heritage_index], function (error, info) {
                                if (error != null)
                                    res.status(503).json(error);
                                else {
                                    res.status(200).json({ like: 'false' });
                                }
                             });//end of if connection
                        }
                    });
                }//end of if(likes_num == 1) 

                else { //likes_num = 0인경우
                    connection.query("INSERT INTO heritage_like (like_user_index, like_heritage_index) VALUES(?, ?)", [decoded.user_index, heritage_index], function (error, info) {
                        if (error != null)
                            res.status(503).json(error);
                        else { // heritage table에서도 총 개수도 수정해준다.

                            connection.query('UPDATE heritage SET likes = likes+1 WHERE heritage_index = ?;', [heritage_index], function (error, info) {
                                if (error != null)
                                    res.status(503).json(error);
                                else {
                                    res.status(200).json({ like: 'true' });
                                }
                            });//end of if connection
                        }
                    });
                }
           }
           else
            {
                res.status(503).json(error);
            }
        });

    }//end of if
    else {
        //토큰이 이상해
        console.log('ERR! get_data/like >>> 토큰이 null 인경우');
        res.status(503).json(error);
    }
});


//문화유산 detail 보내기 (요청 url 예시 http://13.124.223.47:3000/get_data/detail/?heritage_index=1)
router.get('/detail', function (req, res, next) {

    console.log('요청된 유산: ' + req.query.heritage_index); //클라이언트 요청 req의 query부분에서 index 데이터만 추출

    connection.query("SELECT * FROM ?? WHERE heritage_index = ?;", ['heritage', req.query.heritage_index], function (error, cursor) {
        if (undefined !== cursor && cursor.length > 0) {
            
            res.json(cursor);
        }
        else
            res.status(503).json(error);
    });
});


//문화유산 detail 사진들 보내기 (요청 url 예시 http://13.124.223.47:3000/get_data/detail_img/?heritage_index=1)
router.get('/detail_img', function (req, res, next) {

    //console.log('요청된 유산(사진): ' + req.query.heritage_index); //클라이언트 요청 req의 query부분에서 index 데이터만 추출

    connection.query("SELECT img_url, img_des FROM ?? WHERE img_heritage_index = ?;", ['heritage_img', req.query.heritage_index], function (error, cursor) {
        if (undefined !== cursor && cursor.length > 0) {
            res.json(cursor);
        }
        else
            res.status(503).json(error);
    });
});

//문화유산 detail 사진개수 보내기 (요청 url 예시 http://13.124.223.47:3000/get_data/img_count/?heritage_index=1)
router.get('/img_count', function (req, res, next) {

    //console.log('요청된 유산(사진개수): ' + req.query.heritage_index); //클라이언트 요청 req의 query부분에서 index 데이터만 추출

    connection.query("SELECT count(*) AS img_count FROM ?? WHERE img_heritage_index = ?;", ['heritage_img', req.query.heritage_index], function (error, cursor) {
        if (undefined !== cursor && cursor.length > 0) {
            res.json(cursor);
        }
        else
            res.status(503).json(error);
    });
});

//상세 리뷰
router.post('/review', function (req, res, next) {

	var token = req.body.token;

    if (token != null && token.length > 0) {
        var secret = 'cjsckqkr';
        token = jwt.decode(token, secret);
    }

    connection.query("SELECT user.nick_name AS nn, review_user_index, review_heritage_index, review_img, review_content, review_date FROM ??, ?? WHERE user.user_index = review.review_user_index AND review_index = ?;", ['review','user', req.body.review_index], function (error, cursor) {
        if (undefined !== cursor && cursor.length > 0) {
			// 글쓴이와 접속 사용자가 일치하면 true 아니면 false
			cursor[0].mine = (token.user_index == cursor[0].review_user_index);
			delete cursor[0].review_user_index;

			if (cursor[0].nn.length > 3) { //닉네임이 3글자 이상인경우

			    var hidden = cursor[0].nn.substring(0, 2); //두번째 글자까지 자른 후
			    for (var j = 2; j < cursor[0].nn.length; j++) // 나머지 칸은 *로 채우기
			        hidden += '*';

			    cursor[0].nick_name = hidden;
			}
			else { //닉네임이 이름인 경우 ex) 홍길동 홍**
			    hidden = cursor[0].nn.substring(0, 1) + '**';
			    cursor[0].nick_name = hidden;;
			}
			delete cursor[0].nn; //full nickname삭제
			
			res.status(200).json(cursor);
        }
        else
            res.status(503).json(error);
    });
});

//문화 유산에 따른 리뷰
router.get('/heritage_review', function (req, res, next) {

    //console.log('요청된 heritage Index: ' + req.query.heritage_index); //클라이언트 요청 req의 query부분에서 index 데이터만 추출
    var hidden = new Array();

    connection.query("SELECT user.nick_name AS nn, review_index, review_img, review_content FROM ??,?? WHERE user.user_index = review.review_user_index AND review_heritage_index = ?;", ['user', 'review', req.query.heritage_index], function (error, cursor) {
        if (undefined !== cursor && cursor.length > 0) {
            for (var i = 0; i < cursor.length; i++)
            {
                if (cursor[i].nn.length > 3) { //닉네임이 3글자 이상인경우

                    hidden[i] = cursor[i].nn.substring(0, 2); //두번째 글자까지 자른 후
                    for (var j = 2; j < cursor[i].nn.length; j++) // 나머지 칸은 *로 채우기
                        hidden[i] += '*';

                    cursor[i].nickname = hidden[i];
                }
                else { //닉네임이 이름인 경우 ex) 홍길동 홍**
                    hidden[i] = cursor[i].nn.substring(0,1) + '**';
                    cursor[i].nickname = hidden[i];
                }
                delete cursor[i].nn; //full nickname cursor에서 지우기

            }

            res.json(cursor);

        }
        else
            res.status(200).send(null);
    });
});

// 상세 페이지에서 리뷰 이미 작성한 사람이라면 리뷰 작성 버튼 누르면 리뷰는 하나만 작성가능하다면서 작성페이지로 넘어갈 수 없게 처리
router.post('/review_check', function (req, res, next) {
    // 클라에서 받는 내용: 1.token 2.heritage_index
    var token = req.body.token;
    var heritage_index = req.body.heritage_index;

    if (token != null && token.length > 0) {
        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);

        connection.query("SELECT * FROM ?? WHERE review_user_index = ? AND review_heritage_index = ?;", ['review', decoded.user_index, heritage_index], function (error, cursor) {
            // token에 대한 회원이 이미 해당 heritage_index에 대해 리뷰를 작성한 상태일 때
            if (undefined !== cursor && cursor.length > 0) {
                res.status(200).json({ write_review: 'false' });
            }
            else { // token에 대한 회원이 아직 리뷰를 작성하지 않은 상태일 때
                res.status(200).json({ write_review: 'true' });
            }
        });
    }
});





module.exports = router;
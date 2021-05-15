//(김지영) 리뷰 수정 삭제클라에 database 뿌려주기
var express = require('express');
var mysql = require('mysql');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();
var jwt = require('jwt-simple');

var aws = require('aws-sdk');
aws.config.loadFromPath('./config.json');
var multer  = require('multer');
var multers3 = require('multer-s3');
var s3 = new aws.S3({});


//수정된 시간
var date = new Date();
date.setHours(date.getHours() + 9);
date = date.toISOString().replace(/T/, ' ').replace(/\..+/, '');

var upload = multer({ storage: multers3({
	s3: s3,
	bucket: 'future-heritage',
	/*metadata: function (req, file, cb) {
		cb(null, {fieldName: file.fieldname});
	},*/
	key: function (req, file, cb) { // 파일명
		// 두번째 인자로 파일명 지정해주면 됨
		cb(null, 'review/photo_' + Date.now() + '.' + file.originalname.split('.')[1]);
		//cb(null, file.originalname);
	},
	acl: 'public-read'
}) });

//리뷰 수정
router.post('/modify', upload.single('update_review_img'), function (req, res, next) {
	
    var token = req.body.token;
    var review_index = req.body.review_index;
    var review_content = req.body.review_content;
	var review_img;
	
	if (token != null && token.length > 0) {

        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);
        console.log(' review >>> Decoded user index:' + decoded.user_index);
		
		connection.query("SELECT * FROM ?? WHERE review_index = ? AND review_user_index = ?;", ['review', review_index, decoded.user_index], function (error, cursor) {
			if (undefined !== cursor && cursor.length > 0) {
				// 사진 수정이 있었으때
				if (req.file != null) {
					review_img = cursor[0].review_img.substring(55, cursor[0].review_img.length);
					console.log('삭제 예정 이미지: ' + review_img);
					
					// s3 파일 삭제
					if (review_img != 'noImg.png') {
						var del = {
							Bucket: 'future-heritage',
							Key: review_img
						};

						s3.deleteObject(del, function (err, data) {
							if (err) console.log(err, err.stack);
							else {
								console.log('변경전사진이 성공적으로 삭제됨~');
							}
						});
					 }
					
					var url = 'http://future-heritage.s3.ap-northeast-2.amazonaws.com/' + req.file.key;
					console.log('바뀐 이미지 url: ' + url);
					connection.query("UPDATE ?? SET review_content = ?, review_img = ?, review_date = ? WHERE review_user_index = ? AND review_index = ? ;", ['review', review_content, url, date, decoded.user_index, review_index], function (error, cursor) {
						if (error != null) throw error;
						else {
							console.log('글과 사진이 성공적으로 변경됨~');
                            res.status(200).json(cursor);//JSON형식으로 묶기
						}
                	});
					
				}
				// 사진 수정이 없을 때
				else {
					//console.log('사진수정이 없을 떄');
				    connection.query("UPDATE ?? SET review_content = ?, review_date = ? WHERE review_user_index = ? AND review_index = ? ;", ['review', review_content, date, decoded.user_index, review_index], function (error, cursor) {
						if (error != null) throw err;
						else {
							console.log('글이 성공적으로 변경됨~');
                            res.status(200).json({ cursor });//JSON형식으로 묶기
						}
                	});
				}
				
			}
		   else res.status(503).json(error);
		});
	}
	else { //토큰을 request안한경우
		res.status(200).json({ token: null });
	}
});



// 리뷰 삭제하기
router.post('/delete', function (req, res, next) {

    var token = req.body.token;
    var review_index = req.body.review_index;

    //토큰을 request한경우
    if (token != null && token.length > 0) {

        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);
        console.log(' review >>> Decoded user index:' + decoded.user_index);

        connection.query("SELECT ?? FROM ?? WHERE review_user_index = ? AND review_index = ?;",
                     ['review_img', 'futureHeritage.review', decoded.user_index, review_index], function (err, cursor) {
                         if (err != null) throw err;
                         else {
                             // 없는 인덱스 지우려고 하면 에러처리
                             if (cursor[0] == null) res.status(503).send();
                             else {

                                 var review_img = cursor[0].review_img;
                                 review_img = review_img.substring(55, cursor[0].review_img.length);
                                 console.log(review_img);

                                 connection.query("DELETE FROM futureHeritage.review WHERE review_user_index = ? AND review_index = ?;", [decoded.user_index, review_index], function (err, cursor) {
                                     if (err != null) throw err;
                                     else {

                                         // 이미지가 있는 때에만 s3삭제
                                         if (review_img != 'noImg.png') {
                                             var del = {
                                                 Bucket: 'future-heritage',
                                                 Key: review_img
                                             };

                                             s3.deleteObject(del, function (err, data) {
                                                 if (err) console.log(err, err.stack);
                                                 else {
                                                     console.log('사진이 성공적으로 삭제됨~');
                                                 }
                                             });
                                         }

                                         console.log('글이 성공적으로 삭제됨~');
                                         res.status(200).json({ cursor });//JSON형식으로 묶기
                                      }
                                    });
                              }
                      }
            });
       }//end of token if
       else { //토큰을 request안한경우
              //토큰이 없음 로그인안한경우
              res.status(200).json({ token: null });
            }
});


module.exports = router;

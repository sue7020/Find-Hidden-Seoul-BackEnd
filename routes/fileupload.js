//(김지영) s3에 파일 업로드
var express = require('express');
var router = express.Router();
var fs = require('fs');
var jwt = require('jwt-simple');
var mysql = require('mysql');
var db_connection = require('../routes/db_connection.js');

var app = express();

var aws = require('aws-sdk');
aws.config.loadFromPath('./config.json');
var multer  = require('multer');
var multers3 = require('multer-s3');
var s3 = new aws.S3({});

//require('dotenv').load();

var before_level, after_level;

/*
	S3에 업로드하는 방식 2가지
	1) 디스크에 있는 파일을 업로드 -> 업로드 후에 남아있는 파일을 지워줘야 함
	2) 파일 버퍼를 업로드 (선택)
*/

// multer라는 함수에 설정을 줘서 여러가지 제어작업을 주게 되는 것
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

// function이 실행되기 전에 미들웨어(두번째 인자)가 먼저 실행이 됨
// 두번째인자: 사용자가 전송한 데이터에서 만약에 파일이 포함돼 있다면 그 파일을 가공해서 request객체의 파일(file?)이라는 프로퍼티를 암시적으로 추가하도록 약속돼있는 함수
// 만약에 unexpected field가 뜨면 그 이유는 두번째인자의 파라미터가 잘못 지정됐기 때문 -> form의 input태그 name 값을 넣어줘야함
// upload.single()이라는 미들웨어가 함수 호출 전에 호출돼서 req.file에 저장해줌
router.post('/', upload.single('review_img'), function (req, res, next) {

	
    var token = req.body.token;
    var heritage_index = req.body.heritage_index;
    console.log('heritage_index: ' + heritage_index);

    if (token != null && token.length > 0) {
		
        var secret = 'cjsckqkr';
        var decoded = jwt.decode(token, secret);
		
        console.log(' fileupload >>> Decoded user index:' + decoded.user_index);


        var img_url = 'http://future-heritage.s3.ap-northeast-2.amazonaws.com/noImg.png';

        if (req.file == null)
        {
            console.log('File was not uploaded to S3.');
        }
        else
        {
            console.log('File was uploaded to S3 successfully! ' + req.file.key);

            img_url = 'http://future-heritage.s3.ap-northeast-2.amazonaws.com/' + req.file.key;
        }
        //리뷰 받는 부분
        var review = req.body.review_content;
        console.log(review);

        //사용자에게 받은 사진을 S3 업로드 후, 업로드된 url주소를 DB에 삽입

        // 시간 형변환
        var date = new Date();
        date.setHours(date.getHours() + 9);
        date = date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        
        // 리뷰 넣기 전의 레벨 계산
        connection.query("SELECT user_level FROM ?? WHERE user_index = ?;", ['user', decoded.user_index], function(error, info) {
            
            before_level = info[0].user_level;
            console.log('리뷰 저장 전의 level: ' + before_level);
            
            // 리뷰를 DB에 저장
            //review_user_index, review_heritage_index
            connection.query('INSERT INTO review (review_content, review_img, review_date, review_user_index, review_heritage_index) VALUES (?, ?, ?, ?, ?);',[review, img_url, date, decoded.user_index, heritage_index] , function (error, info) {
                if (error != null)
                    res.status(503).json(error);
                else {
                    //console.log(info);

                    // 리뷰 개수 세기
                    connection.query('SELECT COUNT(*) AS review_count FROM ?? WHERE review_user_index = ?;', ['review', decoded.user_index], function (error, cursor) {
                        if (error != null)
                            res.status(503).json(error);
                        else { //사용자 리뷰 갯수에 따른 레벨 정의
                            console.log('리뷰개수 :'+ cursor[0].review_count);

                            //level계산
                            if (cursor[0].review_count == 0) {
                                level = 0;
                            } else if (cursor[0].review_count < 5) {
                                level = 1;
                            } else if (cursor[0].review_count < 10) {
                                level = 2;
                            } else if (cursor[0].review_count < 19) {
                                level = 3;
                            } else if (cursor[0].review_count < 30) {
                                level = 4;
                            } else if (cursor[0].review_count < 41) {
                                level = 5;
                            } else if (cursor[0].review_count < 53) {
                                level = 6;
                            } else if (cursor[0].review_count < 66) {
                                level = 7;
                            } else if (cursor[0].review_count < 79) {
                                level = 8;
                            } else if (cursor[0].review_count < 91) {
                                level = 9;
                            } else if (cursor[0].review_count < 101) {
                                level = 10;
                            } else {
                                level = 11;//만랩
                            }

                            // 레벨 처리
                            connection.query('UPDATE ?? SET user_level = ? WHERE user_index = ?;',['user', level, decoded.user_index] , function (error, result) {
                                if (error != null)
                                    res.status(503).json(error);
                                else {
                                    //console.log(result);

                                    // 리뷰 저장 후 레벨이 바뀌었는지 확인
                                    // 레벨업 처리
                                    connection.query("SELECT user_level FROM ?? WHERE user_index = ?;", ['user', decoded.user_index], function(error, cursor) {
                                        
                                        after_level = cursor[0].user_level;
                                        console.log('리뷰 저장 후의 level: ' + after_level);
                                        
                                        // 레벨업 했다면 클라에 알리기
                                        if(after_level > before_level) {
                                            console.log('레벨업!!!');
                                            res.status(200).json({ levelup: "true" });
                                        }
                                        else {
                                            console.log('노레벨업');
                                            res.status(200).json({ levelup: "false" });
                                        }
                                    });//end of 레벨업 처리 connection
                                }
                            });//end of connection

                        }//end of else
                    });//end of connection
                }
            });//end of connection
        });//end of 큰 connection

        

    }else
        res.status(200).json({token : null});


});

module.exports = router;
//클라에 database 뿌려주기
var express = require('express');
var mysql = require('mysql');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();

// 1)아이디 찾기
router.post('/find_id', function(req, res, next) {
    
    var phone = req.body.phone;
    
    console.log('입력한 전화번호: ' + phone);
    
    // DB에서 입력한 전화번호에 해당하는 아이디 찾아오기
    connection.query("SELECT ?? FROM ?? WHERE phone = ?;", ['user_id', 'user', phone], function(error, cursor) {
        if (undefined !== cursor && cursor.length > 0) { // 입력한 전화번호에 해당하는 아이디가 있다면
            var user_id = cursor[0].user_id;
            
            console.log("찾아온 user_id: " + user_id);
            res.status(200).json({userId: user_id});
        }
        else { // 입력한 전화번호에 해당하는 아이디가 없다면
            console.log("입력한 전화번호에 해당하는 아이디가 없음");
            res.status(200).json({userId: 'false'});
        }
    });
});

// 2)비밀번호 찾기
router.post('/find_pw', function(req, res, next) {
    
    var user_id = req.body.userId;
    var phone = req.body.phone;
    
    console.log('입력한 아이디: ' + user_id);
    console.log('입력한 전화번호: ' + phone);
    
    // DB에 해당 회원이 있나 체크
    connection.query("SELECT * FROM ?? WHERE user_id = ? AND phone = ?;", ['user', user_id, phone], function(error, cursor) {
        if (undefined !== cursor && cursor.length > 0) { // 결과가 뭐라도 나온다면 존재하는 회원이므로 새로운 비밀번호를 입력하라는 신호 보내기
            console.log("해당 회원이 존재함!");
            res.status(200).json({userId: user_id}); // 그 다음 페이지에서 아이디를 받아와 쓰도록 하기위해 클라에 다시 받은 아이디 돌려보냄
        }
        else { // 잘못 입력한 경우
            console.log("잘못 입력한듯?");
            res.status(200).json({userId: 'false'});
        }
    });
});

// 3) 새로운 비밀번호 설정 후 DB에 저장
router.post('/find_pw2', function(req, res, next) {
    
    var user_id = req.body.userId;
    var new_passwd = req.body.new_passwd;

    console.log('새 비밀번호: ' + new_passwd);
    
    // 아이디 제대로 입력됐나 체크하기 위함
    connection.query("SELECT * FROM ?? WHERE user_id = ?;", ['user', user_id], function(error, cursor) {
        if (undefined !== cursor && cursor.length > 0) {
            // DB에 해당 회원의 새로운 비번 저장
            connection.query("UPDATE ?? SET password = ? WHERE user_id = ?;", ['user', new_passwd, user_id], function(error, cursor) {
                if (error != null) { // DB 업데이트 실패
                    throw error;
                }
                else { // 비번 잘 바뀐것
                    console.log("새로운 비번으로 변경 완료!");
                    res.status(200).json({find_pw2: 'true'});
                }
            });
        }// end of if
        else { // 아이디 잘못 입력한 것
            console.log("아이디 잘못 입력한듯?");
            res.status(200).json({find_pw2: 'false'});
        }
    });
});

module.exports = router;
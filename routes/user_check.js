//클라에 database 뿌려주기
var express = require('express');
var mysql = require('mysql');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();

// 중복체크: 1)아이디 2)닉네임 3)전화번호
// 1)아이디 중복체크
router.post('/id_check', function(req, res, next) {
    
    var user_id = req.body.userId;
    
    console.log('보낸 아이디: ' + user_id);
    
    // DB에 똑같은 아이디 없나 체크
    connection.query("SELECT * FROM ?? WHERE user_id = ?;", ['user', user_id], function(error, cursor) {
        if (undefined !== cursor && cursor.length > 0) { // 결과가 뭐라도 나온다면 이미 그 아이디는 있다는 소리
            console.log("/id_check>>> 이미 같은 아이디 존재함!");
            res.status(200).json({userId: 'false'});
        }
        else { // 신규 아이디임
            console.log("/id_check>>> 이 아이디 사용 가능");
            res.status(200).json({userId: 'true'});
        }
    });
});

// 2)닉네임 중복체크
router.post('/nick_check', function(req, res, next) {
    
    var nick_name = req.body.nickname;
    
    console.log('보낸 닉네임: ' + nick_name);

    
    // DB에 똑같은 닉네임 없나 체크
    connection.query("SELECT * FROM ?? WHERE nick_name = ?;", ['user', nick_name], function(error, cursor) {
        if (undefined !== cursor && cursor.length > 0) { // 결과가 뭐라도 나온다면 이미 그 닉네임은 있다는 소리
            console.log("/nick_check>>> 이미 같은 닉네임 존재함!");
            res.status(200).json({nickname: 'false'});
        }
        else { // 신규 아이디임
            console.log("/nick_check>>> 이 닉네임 사용 가능");
            res.status(200).json({nickname: 'true'});
        }
    });
});

// 3)전화번호 중복체크 (아이디 체크할때 전화번호로 하는데, 사람들이 막 입력해 전화번호 중복되는거 방지하기 위함)
router.post('/phone_check', function(req, res, next) {
    
    var phone = req.body.phone;
    
    console.log('보낸 전화번호: ' + phone);
    
    // DB에 똑같은 전화번호 없나 체크
    connection.query("SELECT * FROM ?? WHERE phone = ?;", ['user', phone], function(error, cursor) {
        if (undefined !== cursor && cursor.length > 0) { // 결과가 뭐라도 나온다면 이미 그 전화번호는 있다는 소리
            console.log("/phone_check>>> 이미 같은 전화번호 존재함!");
            res.status(200).json({phone: 'false'});
        }
        else { // 기존에 없던 전화번호일 경우
            console.log("/phone_check>>> 이 전화번호 사용 가능");
            res.status(200).json({phone: 'true'});
        }
    });
});

module.exports = router;
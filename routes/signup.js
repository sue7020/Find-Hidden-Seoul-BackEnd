//클라에 database 뿌려주기
var express = require('express');
var mysql = require('mysql');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();

//var jwt = require('jwt-simple');

//회원 가입
router.post('/', function (req, res, next) {


    var nickname = req.body.nickname;
    var userId = req.body.userId;
    var phone = req.body.phone;
    var password = req.body.password;

    console.log('요청된 아이디: ' + userId); //클라이언트 요청 req의 body부분에서 아이디 데이터만 추출
    console.log('요청된 닉네임: ' + nickname); //클라이언트 요청 req의 body부분에서 닉네임 데이터만 추출
    console.log('요청된 비번:' + password);
    console.log('요청된 전화번호: ' + phone);

    //DB에 회원정보 저장
    connection.query("INSERT INTO user (user_id, nick_name, password, phone) VALUES (?, ?, ?, ?);", [userId, nickname, password, phone], function (err, info) {
        if (err != null)
            //throw err;
            res.status(503).send(err);
        else {
            console.log('signup.js >>>>>>>>>>>>>>>> 회원가입');
            console.log(info);

            res.status(200).send({ Insert: 'success' });


        }//end of connection else

    });//end of insert connectiom
});


module.exports = router;
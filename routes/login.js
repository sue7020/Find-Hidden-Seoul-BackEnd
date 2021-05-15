//자체 로그인
var express = require('express');
var mysql = require('mysql');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();

var jwt = require('jwt-simple');

//로그인 시 클라에서 아이디, 비번을 받아 확인후
//개개인에 대한 인덱스 토큰을 보내줌
router.post('/', function (req, res, next) {

    var userId = req.body.userId;
    var password = req.body.password;

    //DB에 회원정보 저장
    connection.query("SELECT ?? FROM ?? WHERE user_id = ?;", ['user_id', 'user', userId], function (error, cursor) {
        if (undefined !== cursor && cursor.length > 0){ //먼저 아이디가 맞는지 확인

            var id = cursor[0].user_id;
            console.log('로그인 요청id: ' + id);
            console.log('로그인 요청pw: ' + password);

            connection.query("SELECT ?? FROM ?? WHERE user_id = ? AND password = ?;", ['user_index', 'user', id, password], function (error, cursor) {
                if (undefined !== cursor && cursor.length > 0) {

                    console.log('요청된 아이디: ' + id + '의 index -> ' + cursor[0].user_index);
                    user_idx = cursor[0].user_index;

                    //JWT
                    var body = { user_index: user_idx };
                    var secret = 'cjsckqkr';
                    var token = jwt.encode(body, secret);

                    console.log('token :' + token);
                    res.status(200).json({ login: token }); //아이디 비번 모두 일치하면 사용자 토큰 발행

                    var decoded = jwt.decode(token, secret);
                    console.log('decoded:' + JSON.stringify(decoded));

                }//end of if
                else { //비번 틀렸을 경우
                    res.status(200).json({ login: 'wrong PW' });
                }
            });
        }//end of select password if

        else { // 받은 아이디가 존재하지않아..
            res.status(200).json({ login: 'wrong ID' });
        }

    });//end of first select connectiom

});

module.exports = router;

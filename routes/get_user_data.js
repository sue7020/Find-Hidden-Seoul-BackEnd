//클라에 database 뿌려주기
var express = require('express');
var mysql = require('mysql');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();

var jwt = require('jwt-simple');


//로그인 시 클라에서 닉네임,아이디를 받아 
//개개인에 대한 인덱스 토큰을 보내줌
router.post('/user', function (req, res, next) {

    var nickname = req.body.nickname;
    var userId = req.body.userId;

    console.log('요청된 닉네임: ' + nickname); //클라이언트 요청 req의 body부분에서 닉네임 데이터만 추출
    console.log('요청된 아이디: ' + userId); //클라이언트 요청 req의 body부분에서 아이디 데이터만 추출

    

    connection.query("SELECT ?? FROM ?? WHERE user_id = ?;", ['user_index', 'user', userId], function (error, cursor) {
        if (undefined !== cursor && cursor.length > 0) {

            //res.json(cursor);
            console.log(cursor[0].user_index);

            //JWT
            var body = { user_index: cursor[0].user_index };
            var secret = 'cjsckqkr';
            var token = jwt.encode(body, secret);

            res.json({token: token});
            console.log('token :' + token);

            var decoded = jwt.decode(token, secret);
            //console.log('decoded:' + JSON.stringify(decoded));

          

        }
        else { // 보내온 user data가 user DB에 없을 때 (신규 회원일때)
            connection.query("INSERT INTO user (user_id, nick_name) VALUES (?, ?);", [userId, nickname], function (err, info) {
                if (err != null)
                    throw err;
                else {
                    console.log(info);
                    console.log(info.insertId);

                    var user_idx = info.insertId;

                    //JWT
                    var body = { user_index: user_idx };
                    var secret = 'cjsckqkr';
                    var token = jwt.encode(body, secret);

                    console.log('token :' + token);
                    res.status(200).json({ token: token });

                    var decoded = jwt.decode(token, secret);
                    console.log('decoded:' + JSON.stringify(decoded));


                }//end of connection else
                
            });//end of insert connectiom
        } //else
    });
});

/*
router.post('/test', function (req, res) {

    //console.log(req);

    var sent_token = req.body.token;
    console.log(sent_token);
    
    var secret = 'cjsckqkr';
    var d = jwt.decode(sent_token, secret);
    //console.log('decoded:' + JSON.stringify(d));
    console.log('토큰 받았는지 확인용 !! decoded user index:' + d.user_index);


    connection.query("SELECT ?? FROM ?? WHERE user_index  = ?;", ['nick_name', 'user', d.user_index], function (error, cursor) {
        if (undefined !== cursor && cursor.length > 0) {

            res.json(cursor[0]);
        }
        else
            res.status(503).json(error);
    });
});*/

module.exports = router;

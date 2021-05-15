//connecting DB

var mysql = require('mysql');
var express = require('express');
var router = express.Router();

global.connection = mysql.createConnection({

    host: 'futureheritage-rds.cydo0rq0sk6m.ap-northeast-2.rds.amazonaws.com',
    user: 'user',
    port: 3306,
    password: 'cjsckqkd',
    database: 'futureHeritage'

});

//DB error handle
connection.connect(function (err) {

    if (err) {
        console.error('MYSQL Connection Error');
        console.error(err);
        throw err;
    }
    console.log('it works!');

});

module.exports = router;
//각 구에 있는 미래유산 내용을 cheerio 모듈로 scraping한 후, DB에 저장

var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var mysql = require('mysql');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();


//setting page option
var requestOptions = { //강남구로 test
    method: "GET"
                , url: "https://futureheritage.seoul.go.kr/web/investigate/HeritageList.do?searchGubun=&searchContents=&searchGu=3025&searchCategory="
                , headers: { "User-Agent": "Mozilla/5.0" }
                , encoding: null
};


    var name = []; //미래유산 이름
    var category = []; //미래유산 분류
    var location = []; //미래유산 위치


// request 모듈을 이용하여 html 요청
    request(requestOptions, function (error, response, html) {
        if (error) { throw error };

        var result = html.toString(); //html buffer를 string으로 변환
        //console.log(result); //전체 페이지 출력

        $ = cheerio.load(html); 

        
        //미래유산 이름 가져오기
        $('a', '.list_tit_sec').each(function (i) {
            name[i] = $(this).text();
            //console.log(name[i]);
        });
        
        //미래유산 분류 가져오기
        $('span', '.list_tit_sec').each(function (i) {
            category[i] = $(this).text();
            //console.log(category[i]);
        });
        

        //미래유산 위치 가져오기
        $('li', '.list_txt').each(function (i) {
            location[i] = $(this).text();
            //console.log(location[i]);

        });

        for(var j = 0; j < name.length; j++) //순서대로 DB에 입력
        {
            console.log(name[j]);
            console.log(category[j]);
            console.log(location[j]);

            console.log();

            connection.query('INSERT INTO heritage (heritage_name ,category, location) VALUES (?, ?, ?);', [name[j], category[j], location[j]], function (error, info) {
                    if (error != null)
                        res.status(503).json(error);
                    else {
                        console.log(info);
                    }
                });//end of connection

        }//end of for

    });


    module.exports = router;
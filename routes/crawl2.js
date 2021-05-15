//각 미래유산 특징을 cheerio 모듈로 scraping한 후, DB에 저장

var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var mysql = require('mysql');
var db_connection = require('../routes/db_connection.js');
var router = express.Router();


//setting page option

//var url= [];
//강남구들
//url[n] = "https://futureheritage.seoul.go.kr/web/investigate/HeritageView.do?htId" + n.toString() + "&pageIdx=1&rowsPerPage=8&searchGu=3001&searchBunya=&searchGubun=&searchContents=&searchCategory="
//var url_string = url[n].toString();
//console.log(url_string);

var requestOptions = {
    method: "GET"
                , url: "https://futureheritage.seoul.go.kr/web/investigate/HeritageView.do?htId=449&pageIdx=1&rowsPerPage=8&searchGu=&searchBunya=&searchGubun=&searchContents=%EA%B5%AC%EB%A1%9C%EA%B8%B0%EA%B3%84&searchCategory="
                , headers: { "User-Agent": "Mozilla/5.0" }
                , encoding: null
};

var mainImg = [];
var name = []; //미래유산 특징
var cmt = [];
var list = [];
var trans = [];
var newlist = [];

// 상세 페이지 사진 가져오기
var name = [];
var index;
var photo = [];
var photo_des = [];

// request 모듈을 이용하여 html 요청
request(requestOptions, function (error, response, html) {
    if (error) { throw error };

    var result = html.toString(); //html buffer를 string으로 변환
    //console.log(result); //전체 페이지 출력

    $ = cheerio.load(html);

    // 메인 이미지 가져오기
    $('img', '.gall_thumb').each(function (i) {
        mainImg[i] = $(this).attr('src');
    });

    //미래유산 특징 가져오기
    $('td', '.sub_vtable').each(function (i) {
        name[i] = $(this).text().trim();
        //console.log(i + " " + name[i]);
    });

    $('li', '.hv_list').each(function (j) {
        list[j] = $(this).text().trim();
        //console.log(j + " " + list[j]);
        //break;
    });

    /*console.log(name[0]); //대상
    console.log(name[1]); //소재지
    console.log(name[2]); //건립시기
    console.log(name[3]); //건립용도

    //이력사항, 보존필요성
    $('li', '.sub_vtable').each(function (i) {
        list[i] = $(this).text();
    });

    console.log(list[0]); //이력사항
    console.log(list[1]); //보존 필요성*/



    //미래유산 설명문 가져오기
    $('.comment').each(function (i) {
        cmt[i] = $(this).text();
        //console.log(cmt[i]);
    });

    // 상세 페이지에서 이름 긁어오기
    $('.bdv2_tit').each(function (i) {
        name[i] = $(this).text();
        //console.log(name[i]);
    });

    // 상세 페이지에서 이미지들 긁어오기
    $('img', '.gall_slider').each(function (i) {
        if ($(this).attr('src').indexOf("..") == -1) {
            photo[i] = $(this).attr('src');
            photo_des[i] = $(this).attr('alt');
            //console.log(photo[i]);
        }
    });

    /*// 상세 페이지에서 이미지 이름 긁어오기
    $('img', '.gall_slider').each(function(i) {
        if($(this).attr('src').indexOf("..") == -1) {
            photo_des[i] = $(this).attr('alt');
           // console.log(photo_des[i]);
        }
    });*/

    /*console.log(list[2]); //대중교통 (버스-정류소명)
    console.log(list[3]); //대중교통 (버스-버스번호)
    console.log(list[4]); //대중교통 (버스-도보시간)

    console.log(list[3]); //대중교통 (지하철1)
    */

    /*$('li', '.hv_list').each(function (i) {
        trans[i] = $(this).text();
        console.log(trans[0]);
    });

    console.log(name[8]); //주차장
    console.log(name[9]); //주차대수
    console.log(name[10]);//주차비용
    console.log(name[11]);//주차시간
   */


    //for (var j = 0; j < name.length; j++) //순서대로 DB에 입력
    //{
    connection.query('SELECT DISTINCT heritage_index FROM heritage WHERE heritage_name = ?', [name[0]], function (error, cursor) {
        if (undefined !== cursor) {
            console.log(cursor[0].heritage_index);

            connection.query('UPDATE heritage SET heritage_mainImg = ?, gunlipsigi = ?, gunlipyongdo = ?, eeryeok=?, bozone=?, bus_station=?, bus_number=?, bus_walk=?, subway_station=?, subway_walk=?, parkinglot=?, max_parking=?, parking_fee=?, parking_time=?, heritage_detail =? WHERE heritage_index = ?;'
                , [mainImg[0], name[2], name[3], name[4], name[5], null, null, null, null, null, name[8], name[9], name[10], name[11], cmt[0], cursor[0].heritage_index], function (error, info) {
                    if (error != null)
                        //response.status(503).json(error);
                        throw error;
                    else
                        console.log(info);
                });

            // 이제부턴 list[]를 DB에 넣는 부분
            var j = 0;
            for (var i = 0 ; i < list.length ; i++) {
                if (list[i].indexOf("정류소명:") > -1) {
                    connection.query('UPDATE heritage SET bus_station=? WHERE heritage_index = ?;', [list[i], cursor[0].heritage_index], function (error, info) {
                        if (error != null)
                            throw error;
                        else
                            console.log(info);
                    });
                }
                else if (list[i].indexOf("버스번호:") > -1 || list[i].indexOf("다수") > -1) {
                    connection.query('UPDATE heritage SET bus_number=? WHERE heritage_index = ?;', [list[i], cursor[0].heritage_index], function (error, info) {
                        if (error != null)
                            throw error;
                        else
                            console.log(info);
                    });
                }
                else if (list[i].indexOf("도보시간 :") > -1) {
                    newlist[j++] = list[i]; // 버스 도보시간, 지하철 도보시간 구분을 위해.

                    // bus_walk
                    connection.query('UPDATE heritage SET bus_walk=? WHERE heritage_index = ?;', [newlist[0], cursor[0].heritage_index], function (error, info) {
                        if (error != null)
                            throw error;
                        else
                            console.log(info);
                    });

                    // subway_walk
                    connection.query('UPDATE heritage SET subway_walk=? WHERE heritage_index = ?;', [newlist[1], cursor[0].heritage_index], function (error, info) {
                        if (error != null)
                            throw error;
                        else
                            console.log(info);
                    });
                }
                else if (list[i].indexOf("호선") > -1) {
                    connection.query('UPDATE heritage SET subway_station=? WHERE heritage_index = ?;', [list[i], cursor[0].heritage_index], function (error, info) {
                        if (error != null)
                            throw error;
                        else
                            console.log(info);
                    });
                }
            }

            ////////////////////////////////////////////////////주석
            // 상세 페이지에서 이미지들 긁어와 DB에 저장
            for (var k = 0 ; k < photo.length ; k += 2)
                //for(var k = 0 ; k < 1 ; k += 2)
            {
                console.log(photo[k]);
                console.log("\n" + photo_des[k]);

                
                connection.query('INSERT INTO heritage_img (img_heritage_index, img_url, img_des) VALUES (?, ?, ?);', [cursor[0].heritage_index, photo[k], photo_des[k]], function (error, info) {
                    if (error != null)
                        throw error;
                    else {
                        console.log(info);
                    }
                });
            }// end of for
            

            

            /*//DB에 정보가 없다면 추가
            connection.query('UPDATE heritage SET gunlipsigi = ?, gunlipyongdo = ?, eeryeok = ?, bozone =?, bus_station= ?, bus_number= ?, bus_walk= ?, subway_station= ?, subway_walk= ?, parkinglot=?, max_parking=?,parking_fee=?, parking_time=?, heritage_detail =? WHERE heritage_index = ?;'
                , [name[2], name[3], name[4], name[5], list[2], list[3], list[4], list[5], list[6], name[8], name[9], name[10], name[11], cmt[0], cursor[0].heritage_index], function (error, info) {
                if (error != null)
                    //response.status(503).json(error);
                    throw error;
                else
                    console.log(info);
            });*/

        }//end of if

    });//end of connection
    // }//end of for

});

module.exports = router;
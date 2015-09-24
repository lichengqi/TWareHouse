var fs = require('fs');
var path = require('path');
// var $ = require('./$');
var cheerio = require('cheerio');
var request = require('request');
var mkdirp = require('mkdirp');
var intervaltask = require('./intervaltask');

// fs.readFile('sitemap.xml', {
//     encoding: "utf8"
// }, function (err, data) {
//     if (err) throw err;
//     console.log(data);
//     $ = cheerio.load(data);
//     $("loc").each(function() {
//         console.log($(this).text());
//     })
// });
// return;

// fs.appendFileSync("1/2", "http://www.jyeoo.com/math3/ques/detail/7ff7885d-ce52-4189-ba6b-b958e251ed49\n");
// return;

// getUrl("http://www.jyeoo.com/sitemap.xml?t=1&s=22&p=23");

var writeDataPool = new intervaltask(10);

start();

function start() {
    var url = "http://www.jyeoo.com/sitemap.xml";
    request.get({
        method: "GET",
        url: url,
        encoding: "utf8",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.15 Safari/537.36'
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            parseSitemap(body);
        }
    });
}

function parseSitemap(sitemap) {
    $ = cheerio.load(sitemap);
    $("loc").each(function() {
        var qs = $(this).text();
        writeDataPool.addTask(function () {
            getUrl(qs);
        });
    }); 
}

function getUrl(qs) {
    console.log(qs);
    var params = getQueryParams(qs);
    if (params["t"] == undefined || params["s"] == undefined) {
        return;
    }
    if (!fs.existsSync(params["t"])) {
        fs.mkdirSync(params["t"]);
    }
    request.get({
        method: "GET",
        url: qs,
        encoding: "utf8",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.15 Safari/537.36'
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(qs, "success");
            $ = cheerio.load(body);
            $("loc").each(function() {
                var url = $(this).text();
                fs.appendFileSync(
                    [params["t"],params["s"]].join("/"),
                    url+"\n"
                );
            });
        }
        else {
            console.log("retry ", qs);
            getUrl(qs);
        }
    });
}

function getQueryParams(qs) {
    var params = {};
    qs_list = qs.split("?");
    if (qs_list.length < 2) {
        return {};
    }
    qs = qs_list[1];
    var tokens = qs.split("&");
    tokens.forEach(function(token) {
        var pair = token.split("=");
        if (pair.length < 2) {
            return;
        }
        params[pair[0]] = pair[1];
    });
    return params;
}





















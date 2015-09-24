var fs = require('fs');
var path = require('path');
var $ = require('./$');
// var cheerio = require('cheerio');
var request = require('request');
var mkdirp = require('mkdirp');
var intervaltask = require('./intervaltask');
var phantom = require('phantom');

var writeDataPool = new intervaltask(10);

start();

// function start() {
//     var url = "http://spys.ru/free-proxy-list/CN/";
//     request.get({
//         method: "GET",
//         url: url,
//         encoding: "utf8",
//         headers: {
//             'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.15 Safari/537.36'
//         }
//     }, function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             parseSitemap(body);
//         }
//     });
// }

function start() {
    phantom.create(function (ph) {
        ph.createPage(function (page) {
            page.open("http://spys.ru/free-proxy-list/CN/", function (status) {
                console.log("opened proxy? ", status);
                page.evaluate(function () { return document.body.innerHTML; }, function (result) {
                    parseSitemap(result);
                    ph.exit();
                });
            });
        });
    });
}

function parseSitemap(sitemap) {
    // $ = cheerio.load(sitemap);
    var s = "";
    $(sitemap).find("[onmouseover]").each(function() {
        var dom = $(this).children(":eq(0)").find(".spy14");
        if (dom.length > 0) {
            ip = dom[0];
            address = ip.childNodes[0].data+":"+ip.childNodes[3].data+" ";
            console.log(address);
            s += address;
        }
    });
    console.log(s);
}





















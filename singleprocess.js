var fs = require('fs');
var path = require('path');
var $ = require('./$');
var q = require('q');
var _ = require('underscore');
var argv = require('node-argv');
var mkdirp = require('mkdirp');
var request = require('request');
var $http = require('http');
var LineByLineReader = require('line-by-line');
var intervaltask = require('./intervaltask');
var QuestionParser = require('./QuestionParser');

process.on('uncaughtException', function(error){
    console.log(error, 'error');
});

var writeDataPool = new intervaltask(200);
var writeDataPool2 = new intervaltask(10);

var folder, dest, ips;
var kuai = "http://www.kuaidaili.com/api/getproxy/?orderid=993794647276065&num=100&browser=1&protocol=1&method=1&quality=0&sort=1&format=text&sep=3",
    ip = [],
    ip_status = "waiting";

var g_subject_map = {
    "math"       : 14,
    "physics"    : 16,
    "chemistry"  : 17,
    "bio"        : 18,
    "geography"  : 19,
    "math2"      : 1,
    "physics2"   : 4,
    "chemistry2" : 5,
    "bio2"       : 6,
    "geography2" : 7
}

var timeout_wrapper = function(req, url, filename) {
    return function( ) {
        console.log("ERROR: timeout ", filename);
        req.abort();
        // ip_i++;
        writeData(url, filename);
    };
};

start();

function start () {
    init();
    lr = new LineByLineReader(folder);
    lr.on('line', function (line) {
        lr.pause();
        items = line.split("/");
        filename = items[items.length-1];
        writeData(line, filename);
        setTimeout(function () {
            lr.resume();
        }); 
    });
}

function getIp() {
    if (ip_status != "waiting") {
        return;
    }
    ip_status = "picking";
    request.get({
        method: "GET",
        url: kuai,
        encoding: "utf8",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.15 Safari/537.36'
        }
    }, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            ips = data;
            console.log("Info : get ip", ips);
            var pair = ips.split(" ");
            if (pair.length>0) {
                ip = [];
                pair.forEach(function(p) {
                    var tokens = p.split(":");
                    if (tokens.length < 2) {
                        return;
                    }
                    ip.push({
                        host: tokens[0],
                        port: tokens[1],
                        available: 1
                    });
                });
            }
            ip_status = "waiting";
        }
        else {
            console.log("Error : can't connect kuai daili");
            ip_status = "waiting";
            getIp();
        }
    });
}

function init() {
    var options = argv(process.argv, {}).options;
    folder = options.f || options.folder;
    dest = options.d || options.dest || 'data';
    // subject = options.subject || options.s;
    if (!folder || !dest) {
        throw new Error('Usage: --folder,-f folder of the files \r\n--dest,-d save where.\r\n');
    }
    mkdirp(dest, function (error) {
        if (error) {
            return console.log(error);
        }
        getIp();
    });
}

function writeData (url, filename) {
    writeDataPool.addTask(function () {
        getData(url, filename);
    });
}

function getData(url, filename) {
    var available = ip.filter(function(item) {
        return item.available;
    });
    if (available.length==0) {
        getIp();
        writeData(url, filename);
        return;
    }
    var items = url.split("/"),
        subject = g_subject_map[items[items.length-4]];
    var ip_this = available[0],
        host = ip_this.host,
        port = ip_this.port;
    var req = $http.get({
        path: url,
        host: host,
        port: port,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.15 Safari/537.36'
        }
    }, function (res) {
        if (res.statusCode != 200) {
            console.log("Error : can't connect", host+":"+port, filename);
            // ip_i++;
            ip_this.available = 0;
            writeData(url, filename);
            return;
        }
        var data = '';
        res.on('data', function(c) {
            data += c;
        }).on('end', function () {
            var pattern = /【解答】/;
            if (!pattern.test(data)) {
                console.log("Error : must vip", host+":"+port, filename);
                // ip_i++;
                ip_this.available = 0;
                writeData(url, filename);
                return;
            }
            readTask(data, filename, subject);
            console.log("Info : success", host+":"+port, filename);
        });
    });
    req.on('error', function() {
        console.log("Error : can't connect", host+":"+port, filename);
        ip_this.available = 0;
        writeData(url, filename);
        return;
    });
    var fn = timeout_wrapper(req, url, filename);
    var timeout = setTimeout(fn, 15000);
}

function readTask (data, filename, subject) {
    try {
        var parser = new QuestionParser(filename, subject, $('<div>').append(data));
        var question = parser.parse();
        writeData2(question, subject);
    } catch(e) {
        console.log('Error: ', filename, e.message);
    }
}

function writeData2 (question, subject) {
    writeDataPool2.addTask(function () {
        writeTask([question], subject);
    });
}

function writeTask (questions, subject) {
    var data = toString(questions);
    fs.appendFile(path.resolve(dest, String(subject)), data, function (error) {
        if (error) {
            console.log(error);
        }
    });
}

var flag = true;
function toString (ds) {
    function single (d) {
        var ks = _.keys(d);
        ks = _.sortBy(ks);
        if (flag) {
            console.log('(' + ks.map(function (k) { return '`' + k + '`'; }).join(',') + ')');
            flag = false;
        }
        var line = _.map(ks, function (k) {
            return d[k];
        }).join('\t');
        return line;
    }
    return _.map(ds, single).join('\r\n') + '\r\n';
}







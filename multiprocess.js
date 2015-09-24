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

var dest = "17/",
    subject = "17",
    ips = "14.29.116.15:80 111.13.12.216:80 120.192.92.185:8080 218.193.132.35:808 121.15.230.126:9797 122.96.59.105:843 121.199.10.242:80 183.62.60.100:80 121.42.29.118:80 218.78.210.190:8080 211.167.84.53:443 124.202.175.70:8118 123.59.25.227:80 218.204.140.104:8118 58.253.238.242:80 218.201.183.18:8080 219.133.31.120:8888 124.202.242.102:8118 123.124.168.149:80 118.193.249.122:8888 122.70.178.242:8118 58.30.233.196:8088 113.106.93.42:3128 36.250.69.4:80 122.72.33.139:80 163.177.41.34:3128 202.108.35.151:80 119.187.148.35:80 183.207.228.11:82 121.42.152.19:80 58.67.159.50:80 218.204.143.85:8118 58.30.233.198:8080 218.201.89.117:80 118.144.54.247:8118 218.204.143.196:8118 183.207.228.11:80 218.56.172.23:80 202.106.16.36:3128 221.182.62.115:9999 183.63.116.54:9797 122.228.92.103:8000 117.177.243.43:8080 115.239.210.199:80 211.141.130.252:8118 120.237.158.48:8080 117.177.246.144:80 119.136.34.86:80 163.177.79.4:8103 218.204.143.194:8118 120.199.13.190:8080 111.8.179.190:9797 175.188.188.104:8080 119.188.115.18:80 171.15.162.34:8888 183.216.255.20:8118 115.231.96.120:80 121.69.0.154:8118 61.156.3.166:80 111.161.126.100:80 171.15.163.28:8888 117.177.243.42:8085 122.226.172.18:3128 117.177.246.144:81 222.222.251.185:9797 211.141.130.253:8118 222.39.87.21:8118 183.62.9.84:8080 114.112.91.97:90 117.177.243.43:8082 117.177.243.43:85 106.37.177.251:3128 119.188.115.17:80 211.162.0.170:80 211.141.82.247:8118 114.66.7.147:8080 202.106.169.142:80 218.89.170.114:8888 222.45.58.64:8118 124.200.176.146:8118 218.29.155.198:9999 121.201.18.74:3128 220.249.185.178:9999 221.6.123.133:3128 117.177.243.71:86 219.232.114.244:3128 58.246.96.211:8080 42.121.105.155:8888 121.12.167.197:3128 117.177.243.71:8081 222.39.112.12:8118 122.228.92.103:80 111.13.109.52:80 121.69.8.234:8080 115.238.225.26:80 203.192.12.146:80 115.182.83.38:8080 115.159.5.247:80 115.29.43.147:80 163.125.194.134:9999 218.201.183.19:8080 111.161.126.101:80 163.177.79.4:80 112.16.76.188:8080 117.177.243.42:8082 124.65.163.10:8080 114.215.150.13:3128 120.203.159.14:8118 118.244.239.2:3128 120.203.159.17:8118 115.28.92.20:9999 61.174.60.181:4824 112.74.86.238:3128 119.57.30.21:8118 222.174.177.132:8080 122.96.59.105:80 218.27.136.164:8081 122.228.92.103:8080 222.88.236.236:843 117.135.241.78:8080 120.192.92.185:80 202.117.51.250:808 124.126.126.105:80 223.99.189.102:8090 103.27.24.236:81 119.188.115.20:80 101.227.252.130:8081 117.185.124.74:80 218.29.111.106:9999 180.166.56.47:80 171.15.163.165:8888 111.13.55.3:22 183.218.63.174:8118 117.187.10.140:8080 58.68.145.39:80 59.48.106.194:9797 182.254.180.210:3128 120.193.146.93:82 202.194.101.150:80 222.41.113.43:8080 121.11.65.152:3128 124.240.187.89:80 60.2.193.194:9797 218.90.174.167:3128 124.161.14.140:8080 222.133.178.67:80 121.42.26.232:3128 124.133.254.44:9527 211.162.0.162:80 111.161.126.98:80 59.61.79.124:8118 101.226.12.223:80 222.88.236.236:83 223.100.98.44:8000 36.109.239.122:8090 117.79.131.109:8080 123.125.114.167:80 120.203.148.7:8118 220.181.32.106:80 61.130.97.212:8099 183.207.228.11:81 123.125.104.242:80 202.108.23.247:80 122.228.92.103:3128 113.204.212.50:3128 42.121.33.160:8080 117.149.249.176:8123 119.147.161.55:3128 113.245.199.68:80 182.254.153.54:80 118.126.142.209:3128 182.92.212.139:8001 117.185.124.77:8088 60.213.189.170:3988 60.223.236.44:9797 210.82.92.77:3128 58.216.24.91:80 183.207.228.11:85 112.250.70.50:9999 125.46.68.196:80 223.68.6.10:8000 218.204.140.213:8118 58.253.82.4:9000 219.232.117.115:8080 117.177.246.144:82 112.249.90.147:8088 106.38.251.62:8088 103.27.24.236:80 211.162.201.135:8080 61.158.173.188:9999 222.42.146.106:8080 124.161.94.8:80 163.177.41.35:3128 120.198.237.5:8000 120.192.92.184:80 222.45.85.53:8118 203.195.172.147:80 183.218.63.179:8118 111.23.58.46:8118 120.192.92.184:8088",
    ip = [],
    ip_i = 0;

var timeout_wrapper = function(req, url, filename) {
    return function( ) {
        console.log("ERROR: timeout ", filename);
        req.abort();
    };
};

start();

function start () {
    init();
    // var url = "http://www.jyeoo.com/chemistry/ques/detail/abec2e02-242a-485c-85e0-7c9478fd79c9";
    lr = new LineByLineReader('chemistry');
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

function init() {
    var pair = ips.split(" ");
    pair.forEach(function(p) {
        var tokens = p.split(":");
        if (tokens.length < 2) {
            return;
        }
        ip.push({
            host: tokens[0],
            port: tokens[1]
        });
    });
}

function writeData (url, filename) {
    writeDataPool.addTask(function () {
        getData(url, filename);
    });
}

function getData(url, filename) {
    if (ip_i >= ip.length) {
        ip_i = 0;
    }
    var host = ip[ip_i].host,
        port = ip[ip_i].port;
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
            ip_i++;
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
                ip_i++;
                writeData(url, filename);
                return;
            }
            readTask(data, filename, 17);
            console.log("Info : success", host+":"+port, filename);
        });
    });
    req.on('error', function() {
        console.log("Error : can't connect", host+":"+port, filename);
        ip_i++;
        writeData(url, filename);
        return;
    });
    var fn = timeout_wrapper(req, url, filename);
    var timeout = setTimeout(fn, 30000);
}

function readTask (data, filename, subject) {
    try {
        var parser = new QuestionParser(filename, subject, $('<div>').append(data));
        var question = parser.parse();
        writeData2(question);
    } catch(e) {
        console.log('Error: ', filename, e.message);
    }
}

function writeData2 (question) {
    writeDataPool2.addTask(function () {
        writeTask([question]);
    });
}

function writeTask (questions) {
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







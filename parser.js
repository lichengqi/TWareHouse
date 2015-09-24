var fs = require('fs');
var path = require('path');
var $ = require('./$');
var q = require('q');
var _ = require('underscore');
var argv = require('node-argv');
var mkdirp = require('mkdirp');
var intervaltask = require('./intervaltask');
var QuestionParser = require('./QuestionParser');

var readDataPool = new intervaltask(10);
var writeDataPool = new intervaltask(10);

process.on('uncaughtException', function(error){
    console.log(error, 'error');
});

start();
var folder, dest, subject;
function start () {
    var options = argv(process.argv, {}).options;
    folder = options.f || options.folder;
    dest = options.d || options.dest || 'data';
    subject = options.subject || options.s;
    if (!folder || !dest || !subject) {
        throw new Error('Usage: --folder,-f folder of the files \r\n--dest,-d save where.\r\n--subject,-s subject id');
    }
    mkdirp(dest, function (error) {
        if (error) {
            return console.log(error);
        }
        fs.readdir(folder, function (error, filenames) {
            if (error) throw error;
            _.each(filenames, function (filename) {
                readDataPool.addTask(function () {
                    readTask(filename);
                });
            });
        });
    });
}

function readTask (filename) {
     fs.readFile(path.resolve(folder, filename), 'utf8', function (error, data) {
        if (error) {
            return console.log(error);
        }
        try {
            var parser = new QuestionParser(filename, subject, $('<div>').append(data));
            var question = parser.parse();
            writeData(question);
        } catch(e) {
            console.log('error: ', filename, e.message);
        }
     });
}

function writeData (question) {
    writeDataPool.addTask(function () {
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

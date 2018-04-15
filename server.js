'use strict';

const fs = require('fs');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const winston = require('winston');
const app = express();
const schedule = require('node-schedule');

const VisitorInfo = require('./models/totalVisitorCount');

module.exports = app;

const logHome = process.env.LOG || '.';
const blogFilePath = process.env.BLOG_FILE_PATH || '.';

global.blogFileBasePath = blogFilePath;

require('winston-daily-rotate-file');

var transport = new winston.transports.DailyRotateFile({
    filename: logHome + '/blog.log',
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});

var errorLog = new winston.transports.DailyRotateFile({
    filename: logHome + '/error.log',
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    level: 'error'
});

const GitHub = require('github-api');
const gitclient = new GitHub({
    username: process.env.GIT_USERNAME,
    password: process.env.GIT_PASSWORD
});

global.git = {
    needSyncGit: process.env.SYNC_TO_GIT || true,
    repo: gitclient.getRepo('chlde', 'blogs'),
    gist: gitclient.getGist(process.env.GIT_GIST_ID || '92c0366c878f9417c1a1e3cea3b903c0')
};

// sync every five minutes
schedule.scheduleJob('*/1 * * * *', function(fireDate){
    listFileInPath('', fireDate);
});

const blogFileSHACache = {};

const listFileInPath = function (path, dateTime) {
    global.git.repo.getContents('master', path, true, function (err, res) {
        if (err) {
            global.logger.error('list file in path fail, path is:' + path + ', time is:' + dateTime, err);
            return;
        }
        if (res instanceof Array) {
            res.forEach((item) => {
                if (item.type === 'dir') {
                    let localPath = blogFilePath + '/' + item.path;
                    if (!fs.existsSync(localPath)) {
                        fs.mkdirSync(localPath, '0777');
                    }
                    listFileInPath(item.path, dateTime);
                } else if (item.type === 'file') {
                    if (item.name === '.gitignore') {
                        return;
                    } else {
                        if (item.sha) {
                            if (blogFileSHACache[item.path] === item.sha) {
                                return;
                            } else {
                                blogFileSHACache[item.path] = item.sha;
                            }
                        }
                        saveOrUpdateBlogFile(item.path);
                    }
                }
            });
        }
    })
};

const saveOrUpdateBlogFile = function (path) {
    global.git.repo.getContents('master', path, true, function (err, res) {
        let localPath = blogFilePath + '/' + path;
        fs.writeFile(localPath, res, function (err) {
            if (err) {
                global.logger.error('Sync blog to local file:' + path, err);
                delete blogFileSHACache[path];
                return;
            }
            global.logger.info('Sync blog to local success:' + path);
        });
    });
};

global.git.gist.listComments(function (err, res) {
    console.log('Error is :', err);
    for (let i=0; i<res.length; i++) {
        console.log('Res is :', decodeURIComponent(res[i].body));
    }
});

global.logger = new (winston.Logger)({
    transports: [
        transport
    ],
    exceptionHandlers: [
        errorLog
    ],
    exitOnError: false
});

global.env = process.env || [];

require('./server/config/passport')(passport);
require('./server/config/express')(app, passport);
require('./server/config/routes')(app, passport);

const http = require('http').Server(app);
const websocket = require('socket.io')(http);

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

http.listen(app.get('port'), function () {
    global.logger.info('Express server listening on port ' + app.get('port'));
});

let onlineUserCounter = 0;

websocket.on('connection', function(socket) {
    let address = socket.handshake.headers['x-forward-for'];
    global.logger.info('user connected ', address);
    onlineUserCounter++;
    websocket.sockets.emit('currentVisitorNum', onlineUserCounter);

    VisitorInfo.find({visitorIp: address}).sort({createTime: 'desc'})
        .limit(1)
        .exec(function (err, latestVisitMsg) {
            if (err) {
                global.logger.error('save visit login info fail', err);
            }
            let currentTime = new Date();
            if (!latestVisitMsg || !latestVisitMsg[0] || !latestVisitMsg[0].createTime
                || currentTime.getTime() - latestVisitMsg[0].createTime.getTime() > 600000) {
                let visitorInfo = new VisitorInfo({
                    infoId: address + '_' + currentTime.getTime(),
                    visitorIp: address,
                    createTime: currentTime,
                    action: 'login',
                    detailActions: {}
                });
                visitorInfo.save(function(err) {
                    global.logger.error('save visit login record fail', err);
                });
            }
        });

    VisitorInfo.count({action: 'login'}).exec(function (err, number) {
        if (err) {
            global.logger.error('save visit count info fail', err);
        }
        socket.emit('totalVisitorRank', number);
    });

    socket.on('disconnect', function(){
        let address = socket.handshake.headers['x-forward-for'];
        global.logger.info('user disconnected ', address);
        onlineUserCounter--;
        websocket.sockets.emit('currentVisitorNum', onlineUserCounter);
        VisitorInfo.find({visitorIp: address}).sort({createTime: 'desc'})
            .limit(1)
            .exec(function (err, latestVisitMsg) {
                if (err) {
                    global.logger.error('save visit logout info fail', err);
                }
                let currentTime = new Date();
                if (!latestVisitMsg || !latestVisitMsg.createTime
                    || currentTime.getTime() - latestVisitMsg.createTime.getTime() > 60000) {
                    let visitorInfo = new VisitorInfo({
                        infoId: address + '_' + currentTime.getTime(),
                        visitorIp: address,
                        createTime: currentTime,
                        action: 'logout',
                        detailActions: {}
                    });
                    visitorInfo.save(function(err) {
                        if (err) {
                            global.logger.error('save logout fail', err);
                        }
                    });
                }
            });
    });
});

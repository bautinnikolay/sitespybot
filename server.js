const express = require('express');
const {mongoose} = require('./mongoose/mongoose')
const {Site} = require('./models/sites');
const get = require('simple-get');
const schedule = require('node-schedule');
const {Bot} = require('./bot');
let cronFunction = require('./job');
let fs = require('fs');

/* Server logic start here! */
let app = express()

app.set('view engine', 'pug')

app.get('/', (req, res) => {
    res.sendStatus(200);
})

let server = require('http').createServer(app)
/* End server logic */

/* Bot start here! */
Bot.launch();

/* Cron start here! */
const job = schedule.scheduleJob('*/1 * * * *', function() {
    cronFunction.check(Bot, Site, get);
});

const backup = schedule.scheduleJob('59 7 * * *', function() {
    Site.find().then((data) => {
        let json = JSON.stringify(data);
        fs.writeFile('backup.json', json, 'utf8', function(err, result) {
            if(!err) {
                console.log('Backup created ' + new Date());
                Bot.telegram.sendMessage('tg_id_to_send_backup_here', 'Бэкап от ' + new Date());
                Bot.telegram.sendDocument('tg_id_to_send_backup_here', {source: 'backup.json'});
            } else {
                console.log('Cant create backup at' + new Date() + '. Error: ' + err)
            }
        });
    })
});

server.listen(3000);
console.log('Server and bot running... ');

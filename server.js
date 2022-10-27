const express = require('express');
const {mongoose} = require('./mongoose/mongoose')
const {Site} = require('./models/sites');
const get = require('simple-get');
const schedule = require('node-schedule');
const {Bot} = require('./bot');
let cronFunction = require('./job');

/* Server logic start here! */
let app = express()

app.set('view engine', 'pug')

app.get('/', (req, res) => {
    for(let i = 1; i <= 100; i++) {
        let site = new Site({
            chatid: '158842886',
            url: 'https://winerate.ru/test'+i,
            paused: false,
            created: new Date()
        })
        site.save().then(() => {});
    }
    res.sendStatus(200);
})

app.get('/del', (req, res) => {
    Site.deleteMany({paused: false}).then(() => {
        res.sendStatus(200);
    })
})

let server = require('http').createServer(app)
/* End server logic */

/* Bot start here! */
Bot.launch();

/* Cron start here! */
const job = schedule.scheduleJob('*/1 * * * *', function() {
    cronFunction.check(Bot, Site, get);
});

server.listen(3000);
console.log('Server and bot running... ');
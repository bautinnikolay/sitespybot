const { Telegraf } = require('telegraf');
const {mongoose} = require('./mongoose/mongoose')
const {Site} = require('./models/sites');
const get = require('simple-get');
let fs = require('fs');
var validUrl = require('valid-url');

const Bot = new Telegraf('5643151732:AAEHVvehfHviBbPSOy3OPTzNQgw-AxlwdJM');

Bot.command('start', (ctx) => {
    ctx.reply('Привет. Я буду следить за доступностью ваших сайтов, проверяя их раз в минуту.\r\n\r\n/add https://yoursiteurl.com - добавить сайт в список для отслеживания.\r\n\r\n/pause https://yoursiteurl.ru - поставить отслеживание на паузу, снять отслеживание с паузы\r\n\r\n/delete https://yoursiteurl.com - удалить сайт из списка для отслеживания.\r\n\r\n/list - показать ваш список сайтов для отслеживания.\r\n\r\n/help - показать список комманд для бота.\r\n\r\nЕсли есть желание поблагодарить автора, то велком - https://boosty.to/sitespybot', {disable_web_page_preview: true});
})

Bot.command('help', (ctx) => {
    ctx.reply('/add https://yoursiteurl.ru - добавить сайт в список для отслеживания.\r\n\r\n/pause https://yoursiteurl.ru - поставить отслеживание на паузу, снять отслеживание с паузы\r\n\r\n/delete https://yoursiteurl.com - удалить сайт из списка для отслеживания.\r\n\r\n/list - показать ваш список сайтов для отслеживания.\r\n\r\n/help - показать список комманд для бота.\r\n\r\nЕсли есть желание поблагодарить автора, то велком - https://boosty.to/sitespybot', {disable_web_page_preview: true});
})

Bot.command('add', (ctx2) => {
    let url = ctx2.message.text.substring(5);
    if(validUrl.isUri(url)) {
        get.concat(url, function(err, response, data) {
            if (err) {
                ctx2.reply('Упс, похоже что-то пошло не так, либо указан не верный url, либо я не могу до него достучаться (я в РФ, так что мне не все сайты доступны)');
            } else {
                if(response.statusCode == 200 && data.toString().length > 0) {
                    Site.find({chatid: ctx2.from.id, url: url}).then((result) => {
                        if(result.length > 0) {
                            ctx2.reply('Кажется '+url+' уже есть в вашем списке', {disable_web_page_preview: true});
                        } else {
                            let site = new Site({
                                chatid: ctx2.from.id,
                                url: url,
                                paused: false,
                                created: new Date()
                            });
                            site.save().then(() => {
                                ctx2.reply('Добавил '+url+' в список ваших сайтов. Буду следить за ним!', {disable_web_page_preview: true});
                            })
                        }
                    })
                } else {
                    let message = '';
                    if(response.statusCode !== 200) {
                        message = message + 'Урл '+url+' ответил ' + response.statusCode;
                    }
                    if(data.toString().length == 0) {
                        message = message + ' . И размер ответа сервера равен нулю!';
                    }
                    ctx2.reply(message, {disable_web_page_preview: true});
                }
            }
        })
    } else {
        ctx2.reply('Упс, кажется это не url - '+url);
    }
})

Bot.command('pause', (ctx) => {
    let url = ctx.message.text.substring(6);
    Site.findOne({chatid: ctx.from.id, url: url}).then((site) => {
        if(site) {
            if(site.paused) {
                Site.updateOne({chatid: ctx.from.id, url: url}, {$set: {paused: false}}).then(() => {
                    ctx.reply('Опять слежу за '+url, {disable_web_page_preview: true});
                });
            } else {
                Site.updateOne({chatid: ctx.from.id, url: url}, {$set: {paused: true}}).then(() => {
                    ctx.reply('Перестал следить за '+url, {disable_web_page_preview: true});
                });
            }
        } else {
            ctx.reply('В вашем списке нет '+url, {disable_web_page_preview: true});
        }
    })
})

Bot.command('delete', (ctx) => {
    Site.deleteOne({url: ctx.message.text.substring(7)}).then((result) => {
        if(result.deletedCount == 0) {
            ctx.reply('Не нашёл в вашем списке '+ctx.message.text.substring(7), {disable_web_page_preview: true});
        } else {
            ctx.reply(ctx.message.text.substring(7)+' удалён из вашего списка. Больше не буду следить за ним!', {disable_web_page_preview: true});
        }
    })
})

Bot.command('list', (ctx) => {
    Site.find({chatid: ctx.from.id}).then((sites) => {
        if(sites.length > 0) {
            let message = 'Ваш список:\r\n';
            sites.forEach((site) => {
                message = message+site.url;
                if(site.paused) {
                    message = message+' на паузе';
                }
                message = message+'\r\n';
            });
            ctx.reply(message, {disable_web_page_preview: true})
        } else {
            ctx.reply('В вашем списке нет ни одного сайта');
        }
    })
})

Bot.command('stat', (ctx) => {
    if(ctx.from.id === 158842886) {
        Site.find().distinct('chatid').then((users) => {
            Site.find().distinct('url').then((sites) => {
                ctx.reply('На данный момент пользователей - ' + users.length + ', сайтов - ' + sites.length);
            })
        })
    } else {
        ctx.reply('С такими запросами... катитесь... ну Вы поняли');
        ctx.replyWithPhoto({source: './wtf.jpg'});
    }
})

Bot.command('/showmetheway', (ctx) => {
    if(ctx.from.id === 158842886) {
        Site.find({}).then((data) => {
            let json = JSON.stringify(data);
            fs.writeFile('data.json', json, 'utf8', function(err, result) {
                if(!err) {
                    ctx.replyWithDocument({source: 'data.json'});
                } else {
                    ctx.reply('Что-то пошло не так');
                }
            });
        })
    } else {
        ctx.reply('С такими запросами... катитесь... ну Вы поняли');
        ctx.replyWithPhoto({source: './wtf.jpg'});
    }
})

Bot.hears('ты живой?', (ctx) => {
    ctx.replyWithPhoto({source: './ok.jpg'});
    ctx.reply('Держусь пока...');
})

Bot.on('message', (ctx) => {
    ctx.reply('С такими запросами... катитесь... ну Вы поняли');
    ctx.replyWithPhoto({source: './wtf.jpg'});
});

module.exports = {Bot}
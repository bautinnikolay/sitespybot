module.exports.check = function(Bot, Site, get) {
    console.log('started at ' + new Date());
    Site.find({}).then((sites) => {
        let sitesList = [];
        sites.forEach((site) => {
            if(!sitesList.includes(site.url) && !site.paused) {
                sitesList.push(site.url);
                get.concat(site.url, function(err, res, data) {
                    if(err) {
                        Site.find({url: site.url}).then((result) => {
                            result.forEach((point) => {
                                if(!point.paused) {
                                    Bot.telegram.sendMessage(point.chatid, 'Упс, кажется с сайтом '+site.url+' что-то не так, не смогли до него достучаться', {disable_web_page_preview: true}).catch( function(error){ 
                                        if(error.code == 403) {
                                            Site.deleteMany({chatid: point.chatid}).then(() => {});
                                        } 
                                    });
                                }
                            });
                        });
                    } else {
                        if(res.statusCode != 200) {
                            Site.find({url: site.url}).then((result) => {
                                result.forEach((point) => {
                                    if(!point.paused) {
                                        Bot.telegram.sendMessage(point.chatid, 'Упс, кажется с сайтом '+site.url+' что-то не так, код ответа сервера не 200, а '+res.statusCode, {disable_web_page_preview: true}).catch( function(error){
                                            if(error.code == 403) {
                                                Site.deleteMany({chatid: point.chatid}).then(() => {});
                                            }
                                        });
                                    }      
                                });
                            });
                        } else {
                            if(data.toString().length == 0) {
                                Site.find({url: site.url}).then((result) => {
                                    result.forEach((point) => {
                                        if(!point.paused) {
                                            Bot.telegram.sendMessage(point.chatid, 'Упс, кажется с сайтом '+site.url+' что-то не так, приходит пустой ответ от сервера', {disable_web_page_preview: true}).catch( function(error){
                                                if(error.code == 403) {
                                                    Site.deleteMany({chatid: point.chatid}).then(() => {});
                                                }
                                            });
                                        }
                                    });
                                });
                            } 
                        }
                    }
                });     
            }
        })
    });
}
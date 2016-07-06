/*
  _______                            _         _               ____        _   
 |__   __|                          (_)       (_)             |  _ \      | |  
    | |_ __ __ _ _ __  ___ _ __ ___  _ ___ ___ _  ___  _ __   | |_) | ___ | |_ 
    | | '__/ _` | '_ \/ __| '_ ` _ \| / __/ __| |/ _ \| '_ \  |  _ < / _ \| __|
    | | | | (_| | | | \__ \ | | | | | \__ \__ \ | (_) | | | | | |_) | (_) | |_ 
    |_|_|  \__,_|_| |_|___/_| |_| |_|_|___/___/_|\___/|_| |_| |____/ \___/ \__|
    
    © 2016 - Calzà Raffaele (raffaelecalza4@gmail.com)
    Github repository: https://github.com/raffaelecalza/transmission-telegram-bot
*/

var TelegramBot = require('node-telegram-bot-api');
var Transmission = require('transmission');

var config = require('./config.json');

console.log("Initializing the bot...")
var bot = new TelegramBot(config.bot.token, {
    polling: true
});

console.log("Trying to contact transmission session");
var transmission = new Transmission({
    port: config.transmission.port,
    host: config.transmission.address,
    username: config.transmission.username,
    password: config.transmission.password
});

console.log("Yeah! All is configured, your bot now is listening for commands ;)");

bot.on('message', function (msg) {
    console.log("\n\n");
    console.log("Oh.. there's a new incoming message sir!");
    console.log("Here are some details:");
    console.log("Name: " + msg.chat.username);
    console.log("Message: " + msg.text);
});

// Get the list of all torrents
bot.onText(/\/torrentlist/, function (msg) {
    var chatId = msg.chat.id;

    transmission.get(function (err, arg) {
        var reply = "";
        if (err)
            console.error(err);
        else {
            if (arg.torrents.length == 0)
                reply += "Mmh 😕 it seems that there aren't any torrent in the list...";

            for (var i = 0; i < arg.torrents.length; i++)
                reply += i + ") " + arg.torrents[i].name + " (<strong>" + getStatusType(arg.torrents[i].status) + "</strong>)\n";

            bot.sendMessage(chatId, reply, {
                parse_mode: "HTML"
            });
        }
    });
});

bot.onText(/\/torrentstatus/, function (msg) {});

bot.onText(/\/help/, function (msg) {
    var chatId = msg.chat.id;

    var reply = "Available commands:\n/torrentlist - get the list of all torrents\n";
    reply += "/addtorrent - Add new torrent from a link";

    bot.sendMessage(chatId, reply);
});

/*
 *  Functions
 */
// Get torrent state
function getStatusType(type) {
    if (type === 0) {
        return 'STOPPED';
    } else if (type === 1) {
        return 'CHECK_WAIT';
    } else if (type === 2) {
        return 'CHECK';
    } else if (type === 3) {
        return 'DOWNLOAD_WAIT';
    } else if (type === 4) {
        return 'DOWNLOAD';
    } else if (type === 5) {
        return 'SEED_WAIT';
    } else if (type === 6) {
        return 'SEED';
    } else if (type === 7) {
        return 'ISOLATED';
    }
}
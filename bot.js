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
var engine = require('./engine.js');
var formatter = require('./formatter.js');

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

console.log("Yeah! All is configured... Here are your bot information:");
bot.getMe().then(function (info) {
    console.log("Bot username: " + info.username);
});

// End of configuration

var torrents;

// Display every message in the console
bot.on('message', function (msg) {
    console.log("\n\n");
    console.log("Oh.. there's a new incoming message sir!");
    console.log("Here are some details:");
    console.log("From user: " + msg.chat.username);
    console.log("Message id: " + msg.message_id);
    console.log("Message text: " + msg.text);
});

// Get the list of all torrents
bot.onText(/\/torrentlist/, function (msg) {
    var chatId = msg.chat.id;

    transmission.get(function (err, arg) {
        var reply = "";
        if (err) {
            console.error(err);
            bot.sendMessage(chatId, "Error!\n" + err);
        } else {
            if (arg.torrents.length == 0)
                reply += "Mmh 😕 it seems that there isn't any torrent in the list...";
            else
                reply += "<strong>List of current torrents and their status:</strong>\n";

            torrents = arg.torrents;

            for (var i = 0; i < arg.torrents.length; i++) {
                var torrent = arg.torrents[i];
                reply += "Torrent ID: " + torrent.id + "\n";
                reply += torrent.name;
                reply += " (<strong>" + engine.GetStatusType(torrent.status) + "</strong>)\n";

                bot.sendMessage(chatId, reply, {
                    parse_mode: "HTML"
                });
                reply = "";
            }
        }
    });
});

// Get all details about a torrent
bot.onText(/\/torrentstatus/, function (msg) {
    var chatId = msg.chat.id;
    var key = GetKeyBoard();
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: key
        })
    };

    bot.sendMessage(chatId, "Please send me a torrent name :)", opts);
});

bot.onText(/\d+\) .+/, function (msg) {
    var chatId = msg.chat.id;

    var torrentId = msg.text.match(/\d+/)[0];

    var opts = {
        reply_markup: JSON.stringify({
            hide_keyboard: true
        })
    };

    transmission.get(parseInt(torrentId), function (err, result) {
        var reply = "";
        if (err) {
            reply = err;
            throw err;
        }
        if (result.torrents.length > 0) {
            reply = formatter.TorrentDetails(result.torrents[0]);
        } else
            reply = "Ops, the torrent that you specified is not available... Are you sure that you have sended me a valid torrent name?";

        bot.sendMessage(chatId, reply, opts);
    });
});

// Help instructions
bot.onText(/\/help/, function (msg) {
    var chatId = msg.chat.id;

    var reply = "Available commands:\n/torrentlist - get the list of all torrents\n";
    reply += "/torrentstatus - get all details of a torrent by specify his ID\n"
    reply += "/addtorrent - Add new torrent from a link";

    bot.sendMessage(chatId, reply);
});

/*
 *  Functions
 */

// Create a keyboard with all torrent
function GetKeyBoard() {
    var keyboard = [];
    for (var i = 0; i < torrents.length; i++) {
        keyboard.push([torrents[i].id + ') ' + torrents[i].name]);
    }
    return keyboard;
}
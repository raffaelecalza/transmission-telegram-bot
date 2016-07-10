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
var DateTime = require('node-datetime');
var pretty = require('prettysize');

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
                reply += " (<strong>" + getStatusType(torrent.status) + "</strong>)\n";

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
            force_reply: true,
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
            reply = result.torrents[0].name + "\n";
            reply += "📅 Added: " + DateTime.create(result.torrents[0].addedDate) + "\n";
            reply += "⌛️ " + GetRemainingTime(result.torrents[0].eta) + "\n";
            reply += "Size: " + pretty(result.torrents[0].sizeWhenDone) + "\n";
            reply += "➗ " + (result.torrents[0].percentDone * 100).toFixed(2) + "%\n";
            reply += "⬇️ " + pretty(result.torrents[0].rateDownload) + "/s\n";
            reply += "⬆️ " + pretty(result.torrents[0].rateUpload) + "/s\n";
            reply += "📂 " + result.torrents[0].downloadDir + "\n";
            reply += "👥 Peers connected: " + result.torrents[0].peersConnected + "\n";
            reply += "Status = " + getStatusType(result.torrents[0].status);
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

// Create a keyboard with all torrent
function GetKeyBoard() {
    var keyboard = [];
    for (var i = 0; i < torrents.length; i++) {
        keyboard.push([torrents[i].id + ') ' + torrents[i].name]);
    }
    return keyboard;
}

// Get remaining time
function GetRemainingTime(seconds) {
    if (seconds < 0 || seconds >= (999 * 60 * 60))
        return 'remaining time unknown';

    var days = Math.floor(seconds / 86400),
        hours = Math.floor((seconds % 86400) / 3600),
        minutes = Math.floor((seconds % 3600) / 60),
        seconds = Math.floor(seconds % 60),
        d = days + ' ' + (days > 1 ? 'days' : 'day'),
        h = hours + ' ' + (hours > 1 ? 'hours' : 'hour'),
        m = minutes + ' ' + (minutes > 1 ? 'minutes' : 'minute'),
        s = seconds + ' ' + (seconds > 1 ? 'seconds' : 'second');

    if (days) {
        if (days >= 4 || !hours)
            return d + ' remaining';
        return d + ', ' + h + ' remaining';
    }
    if (hours) {
        if (hours >= 4 || !minutes)
            return h + ' remaining';
        return h + ', ' + m + ' remaining';
    }
    if (minutes) {
        if (minutes >= 4 || !seconds)
            return m + ' remaining';
        return m + ', ' + s + ' remaining';
    }

    return s + ' remaining';
}
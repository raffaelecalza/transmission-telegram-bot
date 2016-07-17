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

console.log('Initializing the bot...')
var bot = new TelegramBot(config.bot.token, {
    polling: true
});

console.log('Trying to contact transmission session');
var transmission = new Transmission({
    port: config.transmission.port,
    host: config.transmission.address,
    username: config.transmission.username,
    password: config.transmission.password
});

console.log('Yeah! All is configured... Here are your bot information:');
bot.getMe().then(function (info) {
    console.log('Bot username: ' + info.username);
});

// End of configuration

// Display every message in the console
bot.on('message', function (msg) {
    console.log('\n\n');
    console.log('Oh.. there\'s a new incoming message sir!');
    console.log('Here are some details:');
    console.log('From user: ' + msg.chat.username);
    console.log('Message id: ' + msg.message_id);
    console.log('Message text: ' + msg.text);
});

// Get the list of all torrents
bot.onText(/\/torrentlist/, function (msg) {
    var chatId = msg.chat.id;

    engine.GetTorrentsList((msg) => {
        bot.sendMessage(chatId, msg, {
            parse_mode: 'HTML'
        });
    }, (err) => {
        bot.sendMessage(chatId, err);
    });
});

// Get all details about a torrent
bot.onText(/\/torrentstatus/, function (msg) {
    var chatId = msg.chat.id;
    var keyb = engine.GetKeyBoard('');
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };
    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, 'There isn\'t any torrent here... Please add one using the /addtorrent command');
    else {
        bot.sendMessage(chatId, 'Please send me a torrent name :)', opts);
        torrentAction = 'details';
    }
});

// Stop torrent
bot.onText(/\/stoptorrent/, (msg) => {
    var chatId = msg.chat.id;
    var keyb = engine.GetKeyBoard('⛔️');
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };

    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, 'There isn\'t any torrent here... Please add one using the /addtorrent command');
    else {
        bot.sendMessage(chatId, 'Please send me a torrent name :)', opts);
        torrentAction = 'stop';
    }
});

bot.onText(/\d+\) .+/, function (msg) {
    var chatId = msg.chat.id;

    var torrentId = msg.text.match(/\d+/)[0];

    var opts = {
        reply_markup: JSON.stringify({
            hide_keyboard: true
        })
    };

    if (torrentAction == 'stop')
        engine.StopTorrent(torrentId, (details) => {
            bot.sendMessage(chatId, 'ww', opts);
        }, (err) => {
            bot.sendMessage(chatId, err, opts);
        });
    else if (torrentAction == 'details')
        engine.GetTorrentDetails(torrentId, (details) => {
            bot.sendMessage(chatId, details, opts);
        }, (err) => {
            bot.sendMessage(chatId, err, opts);
        });
});

// Add a torrent from url
bot.onText(/\/addtorrent/, function (msg) {
    var chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Please send me a torrent url');
});

bot.onText(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/, function (msg) {
    var chatId = msg.chat.id;
    engine.AddTorrent(msg.text, (details) => {
        bot.sendMessage(chatId, 'The torrent was added succesfully, here are some information about it\n' + details);
    }, (err) => {
        bot.sendMessage(chatId, 'Ops there was an error, here are some details:\n' + err);
    });
});

// Help instructions
bot.onText(/\/help/, function (msg) {
    var chatId = msg.chat.id;

    var reply = engine.GetCommandsList();

    bot.sendMessage(chatId, reply);
});
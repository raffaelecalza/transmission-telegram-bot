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
var engine = require('./engine.js');

var config = require('./config.json');

console.log('Initializing the bot...')
var bot = new TelegramBot(config.bot.token, {
    polling: true
});

console.log('Yeah! All is configured... Here are your bot information:');
bot.getMe().then(function (info) {
    console.log('Bot username: ' + info.username);
});

// End of configuration

// Action to perform for torrent
var torrentAction;

// Display every message in the console
bot.on('message', function (msg) {
    console.log('\n\n');
    console.log('Oh.. there\'s a new incoming message sir!');
    console.log('Here are some details:');
    console.log('From user: ' + msg.chat.username + '(' + msg.from.id + ')');
    console.log('Message id: ' + msg.message_id);
    console.log('Message text: ' + msg.text);
    /*if (config.bot.users.indexOf(msg.from.id) == -1) */
});

// Start message
bot.onText(/\/start/, function (msg) {
    var chatId = msg.chat.id;
    var reply = 'Hi ' + msg.chat.first_name + ', I\'m your transmission bot... Start send me some commands for control your torrent status. Type /help for a complete list of available commands';
    bot.sendMessage(chatId, reply);
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
    var keyb = engine.GetKeyBoard();
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
bot.onText(/\/torrentstop/, (msg) => {
    var chatId = msg.chat.id;
    var keyb = engine.GetKeyBoard();
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

// Remove torrent
bot.onText(/\/torrentremove/, function (msg) {
    var chatId = msg.chat.id;
    var keyb = engine.GetKeyBoard();
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };

    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, 'There isn\'t any torrent here... Please add one using the /addtorrent command');
    else {
        bot.sendMessage(chatId, 'Please send me a torrent name :)', opts);
        torrentAction = 'remove';
    }
})

// Start torrent
bot.onText(/\/torrentstart/, (msg) => {
    var chatId = msg.chat.id;
    var keyb = engine.GetKeyBoard();
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };

    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, 'There isn\'t any torrent here... Please add one using the /addtorrent command');
    else {
        bot.sendMessage(chatId, 'Please send me a torrent name :)', opts);
        torrentAction = 'start';
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
            bot.sendMessage(chatId, 'Torrent correctly stopped\nUse /torrentstatus to see the updated torrents list', opts);
        }, (err) => {
            bot.sendMessage(chatId, err, opts);
        });
    else if (torrentAction == 'details')
        engine.GetTorrentDetails(torrentId, (details) => {
            bot.sendMessage(chatId, details, opts);
        }, (err) => {
            bot.sendMessage(chatId, err, opts);
        });
    else if (torrentAction == 'start')
        engine.StartTorrent(torrentId, (details) => {
            bot.sendMessage(chatId, 'Torrent correctly started\nUse /torrentstatus to see the updated torrents list', opts);
        }, (err) => {
            bot.sendMessage(chatId, err, opts);
        });
    else if (torrentAction == 'remove')
        engine.RemoveTorrent(torrentId, (details) => {
            bot.sendMessage(chatId, 'Torrent correctly removed\nUse /torrentstatus to see the updated torrents list', opts);
        }, (err) => {
            bot.sendMessage(chatId, err, opts);
        });
});

// Add a torrent from url
bot.onText(/\/addtorrent/, function (msg) {
    var chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Please send me a torrent url');
    torrentAction == 'add';
});

bot.onText(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/, function (msg) {
    var chatId = msg.chat.id;

    if (torrentAction == 'add')
        engine.AddTorrent(msg.text, (details) => {
            bot.sendMessage(chatId, 'The torrent was added succesfully, here are some information about it\n' + details);
        }, (err) => {
            bot.sendMessage(chatId, err);
        });
});

// Help instructions
bot.onText(/\/help/, function (msg) {
    var chatId = msg.chat.id;

    var reply = engine.GetCommandsList();

    bot.sendMessage(chatId, reply);
});

engine.TorrentCompleted = (torrent) => {
    console.log(torrent);
};
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
var userStates = {};

console.log('Initializing the bot...')
var bot = new TelegramBot(config.bot.token, {
    polling: true
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
    console.log('From user: ' + msg.chat.username + '(' + msg.from.id + ')');
    console.log('Message id: ' + msg.message_id);
    console.log('Message text: ' + msg.text);
});

// Start message
bot.onText(/\/start/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var reply = 'Hi ' + msg.chat.first_name + ' 🙌, I\'m your 🤖\nI\'ve been created to give you all the informations regarding the status of your torrents 😊. Start with /help to get a list of all available commands';
    bot.sendMessage(chatId, reply, engine.ListOfCommandsKeyBoard);
});

// Get the list of all torrents
bot.onText(/\/torrentlist|List of all torrents/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;

    engine.GetTorrentsList((msg) => {
        if (engine.torrents.length == 0)
            bot.sendMessage(chatId, engine.NoTorrentText, engine.ListOfCommandsKeyBoard);
        else
            bot.sendMessage(chatId, msg, engine.ListOfCommandsKeyBoard);
    }, (err) => {
        bot.sendMessage(chatId, err);
    });
});

// Get all details about a torrent
bot.onText(/\/torrentstatus|Status/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var keyb = engine.GetKeyBoard();
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };
    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, engine.NoTorrentText, engine.ListOfCommandsKeyBoard);
    else {
        bot.sendMessage(chatId, 'Select a torrent and you\'ll receive all information about it', opts);
        userStates[chatId] = 'details';
    }
});

// Start torrent
bot.onText(/\/torrentstart|▶️ Start/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var keyb = engine.GetKeyBoardPaused();
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };

    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, engine.NoTorrentText, engine.ListOfCommandsKeyBoard);
    else if (keyb.length == 1)
        bot.sendMessage(chatId, 'All torrents are in download queue', engine.ListOfCommandsKeyBoard);
    else {
        bot.sendMessage(chatId, 'Please send me a torrent to put in the download queue 😊', opts);
        userStates[chatId] = 'start';
    }
});

// Stop torrent
bot.onText(/\/torrentstop|⏸ Pause/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var keyb = engine.GetKeyBoardActive();
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };

    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, engine.NoTorrentText, engine.ListOfCommandsKeyBoard);
    else if (keyb.length == 1)
        bot.sendMessage(chatId, "All torrents are currently paused", engine.ListOfCommandsKeyBoard);
    else {
        bot.sendMessage(chatId, 'Which torrent would you stop?', opts);
        userStates[chatId] = 'stop';
    }
});

// Remove torrent
bot.onText(/\/torrentremove|❌ Remove/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var keyb = engine.GetKeyBoard();
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };

    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, engine.NoTorrentText, engine.ListOfCommandsKeyBoard);
    else {
        bot.sendMessage(chatId, '⚠️ Be careful! Once you remove it, you can not retrieve it\nSend me the torrent that you would remove 😊', opts);
        userStates[chatId] = 'remove';
    }
})

bot.onText(/Yes|No/, function (msg) {
    var chatId = msg.chat.id;

    var torrentId = userStates[chatId] || '';
    var answer = msg.text;

    if (answer == 'yes')
        engine.RemoveTorrent(torrentId, (details) => {
            bot.sendMessage(chatId, 'Torrent correctly removed\nUse /torrentstatus to see the updated torrents list', engine.ListOfCommandsKeyBoard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.ListOfCommandsKeyBoard);
        });
    else
        bot.sendMessage(chatId, 'The operation was canceled, narrow escape 😪', engine.ListOfCommandsKeyBoard);
})

bot.onText(/\d+\) .+/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;

    var torrentId = msg.text.match(/\d+/)[0];

    var torrentAction = userStates[chatId] || '';

    if (torrentAction == 'stop')
        engine.StopTorrent(torrentId, (details) => {
            bot.sendMessage(chatId, 'Torrent correctly stopped\nUse /torrentstatus to see the updated torrents list', engine.ListOfCommandsKeyBoard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.ListOfCommandsKeyBoard);
        });
    else if (torrentAction == 'details')
        engine.GetTorrentDetails(torrentId, (details) => {
            bot.sendMessage(chatId, details, engine.ListOfCommandsKeyBoard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.ListOfCommandsKeyBoard);
        });
    else if (torrentAction == 'start')
        engine.StartTorrent(torrentId, (details) => {
            bot.sendMessage(chatId, 'Torrent correctly started\nUse /torrentstatus to see the updated torrents list', engine.ListOfCommandsKeyBoard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.ListOfCommandsKeyBoard);
        });
    else if (torrentAction == 'remove') {
        userStates[chatId] = torrentId;
        bot.sendMessage(chatId, 'Are you sure you want to remove this torrent?', {
            reply_markup: JSON.stringify({
                keyboard: [['Yes', 'No']]
            })
        });
    }
});

// Add a torrent from url
bot.onText(/\/addtorrent|Add torrent/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Please send me a torrent url or send me a torrent file (e.g. file.torrent)', engine.HideKeyBoard);
    userStates[chatId] = 'add';
});

bot.onText(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/, function (msg) {
    var chatId = msg.chat.id;

    var torrentAction = userStates[chatId] || '';
    if (torrentAction == 'add')
        engine.AddTorrent(msg.text, (details) => {
            bot.sendMessage(chatId, 'The torrent was added succesfully, here are some information about it\n' + details, engine.ListOfCommandsKeyBoard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.ListOfCommandsKeyBoard);
        });
});

// Cancel Operation
bot.onText(/Cancel/, function (msg) {
    var chatId = msg.chat.id;
    userStates[chatId] = '';
    bot.sendMessage(chatId, 'The operation was cancelled', engine.ListOfCommandsKeyBoard);
})

bot.on('document', function (msg) {
    var chatId = msg.chat.id;
    var fileId = msg.document.file_id;
    bot.getFileLink(fileId).then((link) => {
        engine.AddTorrent(link, (details) => {
            bot.sendMessage(chatId, 'The torrent was added succesfully, here are some information about it\n' + details, engine.ListOfCommandsKeyBoard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.ListOfCommandsKeyBoard);
        });
    }, (err) => {
        bot.sendMessage(chatId, 'Oops 😰, something seems to have gone wrong while trying to request the link to Telegram servers 😒... Please try again to send the file\nSome details about the error:\n' + JSON.stringify(err));
    });
});

// Settings command
bot.onText(/⚙ Settings/, function (msg) {
    var chatId = msg.chat.id;

    bot.sendMessage(chatId, '🔜 In coming... 🚀', engine.ListOfCommandsKeyBoard);
})

// Help instructions
bot.onText(/\/help|❔ Help/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;

    var reply = engine.GetHelpMsg();

    bot.sendMessage(chatId, reply, engine.ListOfCommandsKeyBoard);
});

engine.TorrentCompleted = (msg) => {
    config.bot.users.forEach((userId) => {
        bot.sendMessage(userId, msg, engine.ListOfCommandsKeyBoard);
    });
};
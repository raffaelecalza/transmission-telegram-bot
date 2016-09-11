'use strict'
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

const TelegramBot = require('node-telegram-bot-api');
const DateTime = require('date-and-time');
const engine = require('./engine.js');

const config = require('./config.json');
var userStates = {};
var userNotification = {};
// Enable notification for each user
config.bot.users.forEach((user) => {
    userNotification[user] = true;
});

console.log('Initializing the bot...')
const bot = new TelegramBot(config.bot.token, {
    polling: true
});

bot.getMe().then(function (info) {
    console.log(`
${info.first_name} is ready, the username is @${info.username}
`);
});

// End of configuration

// Display every message in the console
bot.on('message', function (msg) {
    console.log(`
Oh... there's a new incoming message sir!
-------- Here are some details --------
Authorized user: ${config.bot.users.indexOf(msg.from.id) > -1 ? 'yes' : 'no'}
Date: ${DateTime.format(new Date(msg.date * 1000), 'DD/MM HH:mm')}
From user: ${msg.chat.username || 'no username provided'}
Chat ID: ${msg.chat.id}
Name and surname: ${msg.from.first_name} ${msg.from.last_name}
Message id: ${msg.message_id}
Message text: ${msg.text || 'no text'}
`);
});

console.log('-------- Notify autorizhed users that the bot is up --------');
const wokeUpMsg = `Hey, I woke up just now 😎 and I'm ready to respond to your commands 🙌

👉 If you need help, use the /help command

Anyway when a torrent finishes the download, I'll send you a notification 🔔`;

config.bot.users.forEach(user => {
    if(userNotification[user])
        bot.sendMessage(user, wokeUpMsg, engine.listOfCommandsKeyboard);
})

// Start message
bot.onText(/\/start/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var reply = 'Hi ' + msg.chat.first_name + ' 🙌, I\'m your 🤖\nI\'ve been created to give you all the informations regarding the status of your torrents 😊. Start with /help to get a list of all available commands';
    bot.sendMessage(chatId, reply, engine.listOfCommandsKeyboard);
});

// Get the list of all torrents
bot.onText(/\/torrentlist|List of all torrents/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;

    engine.getTorrentsList((msg) => {
        if (engine.torrents.length == 0)
            bot.sendMessage(chatId, engine.noTorrentsText, engine.listOfCommandsKeyboard);
        else
            bot.sendMessage(chatId, msg, engine.listOfCommandsKeyboard);
    }, (err) => {
        bot.sendMessage(chatId, err);
    });
});

// Get all details about a torrent
bot.onText(/\/torrentstatus|Status/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var keyb = engine.getKeyboard();
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };
    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, engine.noTorrentsText, engine.listOfCommandsKeyboard);
    else {
        bot.sendMessage(chatId, 'Select a torrent and you\'ll receive all information about it', opts);
        userStates[chatId] = 'details';
    }
});

// Start torrent
bot.onText(/\/torrentstart|▶️ Start/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var keyb = engine.getKeyboardPaused();
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };

    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, engine.noTorrentsText, engine.listOfCommandsKeyboard);
    else if (keyb.length == 1)
        bot.sendMessage(chatId, 'All torrents are in download queue', engine.listOfCommandsKeyboard);
    else {
        bot.sendMessage(chatId, 'Please send me a torrent to put in the download queue 😊', opts);
        userStates[chatId] = 'start';
    }
});

// Stop torrent
bot.onText(/\/torrentstop|⏸ Pause/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var keyb = engine.getKeyboardActive();
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };

    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, engine.noTorrentsText, engine.listOfCommandsKeyboard);
    else if (keyb.length == 1)
        bot.sendMessage(chatId, "All torrents are currently paused", engine.listOfCommandsKeyboard);
    else {
        bot.sendMessage(chatId, 'Which torrent would you stop?', opts);
        userStates[chatId] = 'stop';
    }
});

// Remove torrent
bot.onText(/\/torrentremove|❌ Remove/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var keyb = engine.getKeyboard();
    var opts = {
        reply_markup: JSON.stringify({
            keyboard: keyb
        })
    };

    if (engine.torrents.length == 0)
        bot.sendMessage(chatId, engine.noTorrentsText, engine.listOfCommandsKeyboard);
    else {
        bot.sendMessage(chatId, '⚠️ Be careful! Once you remove it, you can not retrieve it\nSend me the torrent that you would remove 😊', opts);
        userStates[chatId] = 'remove';
    }
})

bot.onText(/Yes|No/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;

    var torrentId = userStates[chatId] || '';
    var answer = msg.text;
    
    if (answer == 'Yes')
        engine.removeTorrent(torrentId, (details) => {
            bot.sendMessage(chatId, 'Torrent correctly removed\nUse /torrentstatus to see the updated torrents list', engine.listOfCommandsKeyboard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.listOfCommandsKeyboard);
        });
    else
        bot.sendMessage(chatId, 'The operation was canceled, narrow escape 😪', engine.listOfCommandsKeyboard);
})

bot.onText(/\d+\) .+/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;

    var torrentId = msg.text.match(/\d+/)[0];

    var torrentAction = userStates[chatId] || '';

    if (torrentAction == 'stop')
        engine.pauseTorrent(torrentId, (details) => {
            bot.sendMessage(chatId, 'Torrent correctly stopped\nUse /torrentstatus to see the updated torrents list', engine.listOfCommandsKeyboard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.listOfCommandsKeyboard);
        });
    else if (torrentAction == 'details')
        engine.getTorrentDetails(torrentId, (details) => {
            bot.sendMessage(chatId, details, engine.listOfCommandsKeyboard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.listOfCommandsKeyboard);
        });
    else if (torrentAction == 'start')
        engine.startTorrent(torrentId, (details) => {
            bot.sendMessage(chatId, 'Torrent correctly started\nUse /torrentstatus to see the updated torrents list', engine.listOfCommandsKeyboard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.listOfCommandsKeyboard);
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

    bot.sendMessage(chatId, 'Please send me a torrent url or send me a torrent file (e.g. file.torrent)', engine.hideKeyboard);
    userStates[chatId] = 'add';
});

bot.onText(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;

    var torrentAction = userStates[chatId] || '';
    if (torrentAction == 'add')
        engine.addTorrent(msg.text, (details) => {
            bot.sendMessage(chatId, details, engine.listOfCommandsKeyboard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.listOfCommandsKeyboard);
        });
});

// Cancel Operation
bot.onText(/Cancel/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    userStates[chatId] = '';
    bot.sendMessage(chatId, 'The operation was cancelled', engine.listOfCommandsKeyboard);
})

// Receive a document (for add torrent command)
bot.on('document', function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    var fileId = msg.document.file_id;
    bot.getFileLink(fileId).then((link) => {
        engine.addTorrent(link, (details) => {
            bot.sendMessage(chatId, 'The torrent was added succesfully, here are some information about it\n' + details, engine.listOfCommandsKeyboard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.listOfCommandsKeyboard);
        });
    }, (err) => {
        bot.sendMessage(chatId, 'Oops 😰, something seems to have gone wrong while trying to request the link to Telegram servers 😒... Please try again to send the file\nSome details about the error:\n' + JSON.stringify(err));
    });
});

// Settings command
bot.onText(/\/settings|⚙ Settings/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Please select one voice from the list', engine.settingsKeyboard);
})

bot.onText(/🔙 menu/, function(msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    
    var chatId = msg.chat.id;
    bot.sendMessage(chatId, 'What would you see?', engine.listOfCommandsKeyboard);
})

bot.onText(/Transmission info/, function(msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    engine.getSessionDetails((msg) => {
        bot.sendMessage(chatId, msg, engine.settingsKeyboard);
    });
})

bot.onText(/User notification/, function(msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Would you enable or disable the notifications?', {
        reply_markup: JSON.stringify({
            keyboard: [['Enable', 'Disable']]
        })
    });
})

bot.onText(/Enable|Disable/, function(msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    if(msg.text == 'Enable') {
        userNotification[chatId] = true;
        bot.sendMessage(chatId, 'Notifications enabled 🔔, you\'ll receive a message when a torrent is completely downloaded', engine.settingsKeyboard);
    } else if(msg.text == 'Disable') {
        userNotification[chatId] = false;
        bot.sendMessage(chatId, 'Notification disabled 🔕, you\'ll not receive any notification when a torrent is downloaded completely', engine.settingsKeyboard);
    }
})

bot.onText(/Set download folder/, function(msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    userStates[chatId] = 'set-folder' || '';
    bot.sendMessage(chatId, 'Please send me the new folder where next torrents will be downloaded', engine.hideKeyboard);
})

bot.onText(/(\/\w+)+\//g, function(msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;
    if(userStates[chatId] == 'set-folder')
        engine.setSettings({'download-dir': msg.text}, () => {
            bot.sendMessage(chatId, 'The download 📂 was changed 👌', engine.settingsKeyboard);
        }, (err) => {
            bot.sendMessage(chatId, err, engine.settingsKeyboard);
        });
})

// End of settings

// Help instructions
bot.onText(/\/help|❔ Help/, function (msg) {
    if (config.bot.users.indexOf(msg.from.id) == -1) return;
    var chatId = msg.chat.id;

    bot.sendMessage(chatId, engine.helpMsg, engine.listOfCommandsKeyboard);
});

// Callback when a torrent is completed
engine.torrentCompleted = (msg) => {
    config.bot.users.forEach((userId) => {
        if(userNotification[userId])
            bot.sendMessage(userId, msg, engine.listOfCommandsKeyboard);
    });
};
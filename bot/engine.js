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
const Transmission = require('transmission');
const formatter = require('./formatter.js');
const config = require('./config.json');

console.log('Configuring transmission session');
const transmission = new Transmission({
    port: config.transmission.port,
    host: config.transmission.address,
    username: config.transmission.username,
    password: config.transmission.password
});
console.log(`-------- Session configured --------
IP address and port --> ${config.transmission.address}:${config.transmission.port}
Username: ${config.transmission.username|| 'none'}
Password: ${config.transmission.password || 'none'}
`);

var exports = module.exports = {};
var oldList = exports.torrents = [];

exports.UpdateTorrentList = () => {
    transmission.get(function (err, arg) {
        if (err)
            console.error(err);
        else {
            oldList = exports.torrents;
            exports.torrents = arg.torrents;
            console.log('Downloaded the new list of torrents');

            exports.CheckCompletedTorrents();
        }
    });
}

exports.CheckCompletedTorrents = () => {
    oldList.forEach(torrent => {
        // Search the torrent in the new list
        for (var i = 0; i < exports.torrents.length; i++) {
            if (torrent.name === exports.torrents[i].name && torrent.status != exports.torrents[i].status && exports.torrents[i].status === 6)
                exports.TorrentCompleted(formatter.FormatComplete(torrent));
        }
    });
}

// Create a keyboard with all torrent
exports.GetKeyBoard = () => {
    var keyboard = [['Cancel']];
    exports.torrents.forEach(torrent => {
        keyboard.push([`${torrent.id}) ${torrent.name}`]);
    });
    return keyboard;
}

exports.GetKeyBoardActive = () => {
    var keyboard = [['Cancel']];
    exports.torrents.forEach(torrent => {
        if (torrent.status > 3)
            keyboard.push([`${torrent.id}) ${torrent.name}`]);
    });
    return keyboard;
}

exports.GetKeyBoardPaused = () => {
    var keyboard = [['Cancel']];
    exports.torrents.forEach(torrent => {
        if (torrent.status == 0)
            keyboard.push([`${torrent.id}) ${torrent.name}`]);
    });
    return keyboard;
}

exports.GetTorrentsList = (success, error) => {
    transmission.get(function (err, arg) {
        if (err)
            error(formatter.ErrorMessage(err));
        else {
            exports.torrents = arg.torrents;
            success(formatter.TorrentsList(arg.torrents));
        }
    });
}

exports.GetTorrentDetails = (id, success, error) => {
    transmission.get(parseInt(id), function (err, result) {
        if (err) {
            error(formatter.ErrorMessage(err));
            return;
        }
        if (result.torrents.length > 0)
            success(formatter.TorrentDetails(result.torrents[0]));
    });
}

// Add a torrent from url
exports.AddTorrent = (url, success, error) => {
    transmission.addUrl(url, function (err, result) {
        if (err) {
            error(formatter.ErrorMessage(err));
            return;
        }

        // Update torrent list
        exports.UpdateTorrentList();
        success(formatter.NewTorrent(result));
    });
}

exports.StopTorrent = (id, success, error) => {
    transmission.stop(parseInt(id), function (err, result) {
        if (err)
            error(formatter.ErrorMessage(err));
        else {
            // Update torrent list
            exports.UpdateTorrentList();
            success(result);
        }
    });
}

exports.StartTorrent = (id, success, error) => {
    transmission.start(parseInt(id), function (err, result) {
        if (err)
            error(formatter.ErrorMessage(err));
        else {
            // Update torrent list
            exports.UpdateTorrentList();
            success(result);
        }
    });
}

exports.RemoveTorrent = (id, success, error) => {
    transmission.remove(parseInt(id), function (err, result) {
        if (err)
            error(formatter.ErrorMessage(err));
        else {
            // Update torrent list
            exports.UpdateTorrentList();
            success(result);
        }
    });
}

// Hide keyboard for bot
exports.ListOfCommandsKeyBoard = {
    reply_markup: JSON.stringify({
        keyboard: [
            ['List of all torrents'],
            ['Status', 'Add torrent'],
            ['▶️ Start', '⏸ Pause', '❌ Remove'],
            ['⚙ Settings', '❔ Help']
        ]
    }),
    parse_mode: 'html',
    disable_web_page_preview: true
}

exports.HideKeyBoard = {
    reply_markup: JSON.stringify({
        keyboard: [['Cancel']]
    })
}

// String to send when the list of torrents is empty
exports.NoTorrentText = 'Mmh 😕 it seems that there isn\'t any torrent in the list...\nAdd one by using the /addtorrent command 😉';

/*
 *  Help message
 */
exports.GetHelpMsg = () => {
    var helpMsg = `<b>Transmission Telegram Bot</b>
Available commands:
• List of torrents
• Torrent status
• Add torrent
• Start, Pause, Remove torrent
• Settings

If you have a suggestion or discovered a bug please report me 👉 <a href="https://github.com/raffaelecalza/transmission-telegram-bot/issues">here</a>
<b>🤖 Bot version: ${config.bot.version}</b>

Creator: <a href="http://raffaelecalza.tk">Raffaele Calzà</a>, buy me a coffee or a beer 🍻 click <a href="http://bit.ly/transmission-bot">here</a>
Follow me on the socials if you like the project, thanks 😎👍`
    return helpMsg;
}

// Download the torrent list every minute
exports.UpdateTorrentList();

setInterval(exports.UpdateTorrentList, 60000);
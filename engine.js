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
var Transmission = require('transmission');
var formatter = require('./formatter.js');
var config = require('./config.json');

console.log('Trying to contact transmission session');
var transmission = new Transmission({
    port: config.transmission.port,
    host: config.transmission.address,
    username: config.transmission.username,
    password: config.transmission.password
});

var exports = module.exports = {};
var oldList = exports.torrents = [];

exports.UpdateTorrentList = () => {
    transmission.get(function (err, arg) {
        if (err) {
            console.error(err);
        } else {
            oldList = exports.torrents;
            exports.torrents = arg.torrents;
            console.log("Downloaded the new list of torrents");

            exports.CheckCompletedTorrents();
        }
    });
}

exports.CheckCompletedTorrents = () => {
    oldList.forEach((torrent) => {
        // Search the torrent in the new list
        for (var i = 0; i < exports.torrents.length; i++) {
            if (torrent.name === exports.torrents[i].name && torrent.status != exports.torrents[i].status && exports.torrents[i].status === 6)
                exports.TorrentCompleted(torrent);
        }
    });
}

// Create a keyboard with all torrent
exports.GetKeyBoard = () => {
    var keyboard = [];
    exports.torrents.forEach((torrent) => {
        keyboard.push([torrent.id + ') ' + torrent.name]);
    });
    return keyboard;
}

exports.GetKeyBoardActive = () => {
    var keyboard = [];
    exports.torrents.forEach((torrent) => {
        if (torrent.status > 3)
            keyboard.push([torrent.id + ') ' + torrent.name]);
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
exports.HideKeyBoardOpts = {
    reply_markup: JSON.stringify({
        hide_keyboard: true
    }),
    parse_mode: 'html',
    disable_web_page_preview: true
}

// String to send when the list of torrents is empty
exports.NoTorrentText = 'Mmh 😕 it seems that there isn\'t any torrent in the list...\nAdd one by using the /addtorrent command 😉';

/*
 *  Commands list
 */
var commands = [
    {
        command: '/torrentlist',
        description: 'Get the list of all torrents'
    },
    {
        command: '/torrentstatus',
        description: 'Get all details of a torrent by specify his ID'
    },
    {
        command: '/addtorrent',
        description: 'Add new torrent from a link'
    },
    {
        command: '/torrentstart',
        description: 'Put a torrent in download'
    },
    {
        command: '/torrentstop',
        description: 'Stop a torrent in download'
    },
    {
        command: '/torrentremove',
        description: '⚠️ Remove the torrent from the list (be careful)'
    }
];
exports.GetCommandsList = () => {
    var commandsString = '📋 Available commands:\n';
    commands.forEach(function (command) {
        commandsString += command.command + ' - ' + command.description + '\n';
    });
    return commandsString;
}

// Download the torrent list every minute
exports.UpdateTorrentList();

setInterval(exports.UpdateTorrentList, 60000);
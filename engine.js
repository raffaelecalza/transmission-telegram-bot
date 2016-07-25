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

exports.UpdateTorrentList = () => {
    transmission.get(function (err, arg) {
        var reply = "";
        if (err) {
            console.error(err);
        } else {
            exports.torrents = arg.torrents;
            console.log("Downloaded the new list of torrents");
            exports.CheckCompletedTorrents();
        }
    });
}

exports.CheckCompletedTorrents = () => {
    exports.torrents.forEach((torrent) => {
        if (torrent.status === 6)
            exports.TorrentCompleted(torrent);
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
        else
            success(result);
    });
}

exports.StartTorrent = (id, success, error) => {
    arr.push(id);
    transmission.start(parseInt(id), function (err, result) {
        if (err)
            error(formatter.ErrorMessage(err));
        else
            success(result);
    });
}

exports.RemoveTorrent = (id, success, error) => {
    transmission.remove(parseInt(id), function (err, result) {
        if (err)
            error(formatter.ErrorMessage(err));
        else
            success(result);
    });
}

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
    }
];
exports.GetCommandsList = () => {
    var commandsString = '';
    commands.forEach(function (command) {
        commandsString += command.command + ' - ' + command.description + '\n';
    });
    return commandsString;
}

// Download the torrent list every minute
exports.UpdateTorrentList();
setInterval(exports.UpdateTorrentList, 60000);
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
        }
    });
    console.log("Downloaded the new list of torrents");
}

// Create a keyboard with all torrent
exports.GetKeyBoard = (char) => {
    var keyboard = [];
    exports.torrents.forEach((torrent) => {
        keyboard.push([char + torrent.id + ') ' + torrent.name]);
    });
    return keyboard;
}

exports.GetTorrentsList = (success, error) => {
    transmission.get(function (err, arg) {
        if (err)
            error(formatter.ErrorMessage(err));
        else
            success(formatter.TorrentsList(arg.torrents));
    });
}

exports.GetTorrentDetails = (id, success, error) => {
    transmission.get(parseInt(id), function (err, result) {
        if (err)
            error(err);
        else if (result.torrents.length > 0)
            success(formatter.TorrentDetails(result.torrents[0]));
    });
}

// Add a torrent from url
exports.AddTorrent = (url, success, error) => {
    transmission.addUrl(url, function (err, result) {
        if (err)
            return error(err);

        // Update torrent list
        exports.UpdateTorrentList();
        success(formatter.NewTorrent(result));
    });
}

exports.StopTorrent = (id, success, error) => {
    transmission.stop(id, function (err, result) {
        if (err)
            error(err);
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
        command: '/starttorrent',
        description: 'Put a torrent in download'
    },
    {
        command: '/stoptorrent',
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

// Download the torrent list every 2 minutes
exports.UpdateTorrentList();
setInterval(exports.UpdateTorrentList, 60000);
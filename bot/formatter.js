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

var DateTime = require('date-and-time');
var pretty = require('prettysize');
var engine = require('./engine.js');

var exports = module.exports = {};

exports.TorrentsList = (list) => {
    var formattedString = '';
    if (list.length > 0) {
        formattedString += '<strong>List of current torrents and their status:</strong>\n';

        list.forEach((torrent) => {
            formattedString += '<b>ID: ' + torrent.id + '</b>\n'
            formattedString += torrent.name;
            formattedString += ' (<b>' + exports.GetStatusType(torrent.status) + '</b>)\n';
            formattedString += '➗ ' + (torrent.percentDone * 100).toFixed(2) + '%\n';
            formattedString += '⌛️ ' + exports.GetRemainingTime(torrent.eta) + '\n';
            formattedString += '⬇️ ' + pretty(torrent.rateDownload) + '/s - ';
            formattedString += '⬆️ ' + pretty(torrent.rateUpload) + '/s';
            formattedString += '\n\n';
        });
    }
    return formattedString;
}

exports.TorrentDetails = (torrent) => {
    var formattedString;
    formattedString = torrent.name + '\n\n';

    var addedDate = FormatTorrentDate(torrent.addedDate);

    formattedString += 'Status = <b>' + exports.GetStatusType(torrent.status) + '</b>\n';
    formattedString += '⌛️ ' + exports.GetRemainingTime(torrent.eta) + '\n';
    formattedString += '➗ <b>' + (torrent.percentDone * 100).toFixed(2) + '%</b>\n';
    formattedString += '⬇️ ' + pretty(torrent.rateDownload) + '/s - ';
    formattedString += '⬆️ ' + pretty(torrent.rateUpload) + '/s\n\n';
    formattedString += 'Size: ' + pretty(torrent.sizeWhenDone) + '\n';
    formattedString += '📅 Added: ' + DateTime.format(addedDate, 'dddd, DD MMMM HH:mm') + '\n';
    formattedString += '📂 ' + torrent.downloadDir + '\n';
    formattedString += '👥 Peers connected: ' + torrent.peersConnected;

    return formattedString;
}

exports.NewTorrent = (torrent) => {
    var formattedString = 'ID torrent: ' + torrent.id;
    formattedString += '\nTorrent name: ' + torrent.name;
    return formattedString;
}

exports.ErrorMessage = (err) => {
    return 'Ops there was an error 😰, here are some details:\n' + err;
}

exports.FormatComplete = (torrent) => {
    var msg = 'Oh, a torrent has been downloaded completely 🙌\nHere are some details 😏:\n';
    msg += '<b>' + torrent.name + '</b>\n\n';
    var addedDate = FormatTorrentDate(torrent.addedDate);
    var doneDate = FormatTorrentDate(torrent.doneDate);
    msg += '📅 ' + DateTime.format(addedDate, 'DD/MM HH:mm') + ' - ' + DateTime.format(doneDate, 'DD/MM HH:mm') + '\n';
    msg += '🕔 ' + DifferenceToString(DateTime.subtract(doneDate, addedDate).toSeconds()) + '\n';
    msg += 'Size: ' + pretty(torrent.sizeWhenDone) + '\n\n';
    msg += '📂 ' + torrent.downloadDir + '\n';
    return msg;
}

function DifferenceToString(seconds) {
    var string = '';
    var sec_num = parseInt(seconds, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours > 0)
        string += hours + ' hours, ';
    if (minutes > 0)
        string += minutes + ' minutes, ';
    if (seconds > 0)
        string += seconds + ' seconds';
    if (string.length == 0)
        string = 'Time not available';
    return string;
}

function FormatTorrentDate(date) {
    var mEpoch = parseInt(date);
    // To milliseconds
    mEpoch *= 1000;
    return new Date(mEpoch);
}

/*
 *  Copied from Transmission web interface
 *  It returns the remaining time of a torrent
 */
exports.GetRemainingTime = (seconds) => {
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
};

/*
 *  Returns the torrent status in words
 */
exports.GetStatusType = (type) => {
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
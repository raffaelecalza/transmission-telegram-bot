var DateTime = require('date-and-time');
var pretty = require('prettysize');
var engine = require('./engine.js');

var exports = module.exports = {};

exports.TorrentsList = (list) => {
    var formattedString = '';
    if (list.length == 0)
        formattedString += 'Mmh 😕 it seems that there isn\'t any torrent in the list...';
    else
        formattedString += '<strong>List of current torrents and their status:</strong>\n';

    list.forEach((torrent) => {
        formattedString += 'Torrent ID: ' + torrent.id + '\n';
        formattedString += torrent.name;
        formattedString += ' (<strong>' + exports.GetStatusType(torrent.status) + '</strong>)\n';
    });
    return formattedString;
}

exports.TorrentDetails = (torrent) => {
    var formattedString;
    formattedString = torrent.name + "\n";

    var mEpoch = parseInt(torrent.addedDate);
    // To milliseconds
    mEpoch *= 1000;

    var addedDate = new Date(mEpoch);

    formattedString += "📅 Added: " + DateTime.format(addedDate, 'YYYY/MM/DD HH:mm:ss') + "\n";
    formattedString += "⌛️ " + exports.GetRemainingTime(torrent.eta) + "\n";
    formattedString += "Size: " + pretty(torrent.sizeWhenDone) + "\n";
    formattedString += "➗ " + (torrent.percentDone * 100).toFixed(2) + "%\n";
    formattedString += "⬇️ " + pretty(torrent.rateDownload) + "/s\n";
    formattedString += "⬆️ " + pretty(torrent.rateUpload) + "/s\n";
    formattedString += "📂 " + torrent.downloadDir + "\n";
    formattedString += "👥 Peers connected: " + torrent.peersConnected + "\n";
    formattedString += "Status = " + exports.GetStatusType(torrent.status);

    return formattedString;
}

exports.NewTorrent = (torrent) => {
    var formattedString = "ID torrent: " + torrent.id;
    formattedString += "\nTorrent name: " + torrent.name;
    return formattedString;
}

exports.ErrorMessage = (err) => {
    return 'Ops there was an error, here are some details:\n' + err;
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
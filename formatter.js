var DateTime = require('date-and-time');
var pretty = require('prettysize');
var engine = require('./engine.js');

var exports = module.exports = {};

exports.TorrentDetails = (torrent) => {
    var formattedString;
    formattedString = torrent.name + "\n";

    var mEpoch = parseInt(torrent.addedDate);
    // To milliseconds
    mEpoch *= 1000;

    var addedDate = new Date(mEpoch);

    formattedString += "📅 Added: " + DateTime.format(addedDate, 'YYYY/MM/DD HH:mm:ss') + "\n";
    formattedString += "⌛️ " + engine.GetRemainingTime(torrent.eta) + "\n";
    formattedString += "Size: " + pretty(torrent.sizeWhenDone) + "\n";
    formattedString += "➗ " + (torrent.percentDone * 100).toFixed(2) + "%\n";
    formattedString += "⬇️ " + pretty(torrent.rateDownload) + "/s\n";
    formattedString += "⬆️ " + pretty(torrent.rateUpload) + "/s\n";
    formattedString += "📂 " + torrent.downloadDir + "\n";
    formattedString += "👥 Peers connected: " + torrent.peersConnected + "\n";
    formattedString += "Status = " + engine.GetStatusType(torrent.status);

    return formattedString;
}
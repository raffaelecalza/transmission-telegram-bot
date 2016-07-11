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
var exports = module.exports = {};

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
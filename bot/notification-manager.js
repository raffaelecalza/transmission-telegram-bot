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
const fs = require('fs');

var exports = module.exports = {};

exports.fileExists = () => {
    return fs.existsSync(__dirname + '/user-notification.json');
}

exports.loadFile = () => {
    return JSON.parse(fs.readFileSync(__dirname + '/user-notification.json', 'utf8'));
}

exports.saveFile = (obj) => {
    fs.writeFile(__dirname + '/user-notification.json', JSON.stringify(obj), (err) => {
        if(err) throw err;
    });
}
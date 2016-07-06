# transmission-telegram-bot
Simple telegram bot for controlling your torrents status

## Config file
Under construction
```javascript
{
    "botToken": "INSERT HERE YOUR TOKEN",
    "ipAddress": "TRANSMISSION IP ADDRESS",
    "credentials": {
        "username": "YOUR USERNAME, EMPTY IF NONE",
        "password": "YOUR PASSWORD, EMPTY IF NONE"
    },
    "port": 9091
}
```

## Commands
* <code>/torrentstatus</code> - Get the status of all torrents
* <code>/addtorrent</code> - Add a new torrent from an url
* <code>/help</code> - Get the list of available commands

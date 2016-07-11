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
* ✅<code>/torrentlist</code> - Get the status of all torrents (id - name - status);
* <code>/addtorrent</code> - Add a new torrent from an url;
* ✅<code>/torrentstatus</code> - Get all details about a torrent;
* <code>/removetorrent</code> - Remove a specified torrent from the list;
* <code>/starttorrent</code> - Start a torrent;
* <code>/stoptorrent</code> - Stop a torrent;
* ✅<code>/help</code> - Get the list of available commands;

## TODO
* cron torrents list;
* notify user when a torrent is completed;
* separate buisness logic (2 modules);

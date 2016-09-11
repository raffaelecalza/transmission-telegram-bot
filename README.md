<h1 align="center">
  <br>
  <img src="https://github.com/raffaelecalza/transmission-telegram-bot/blob/master/logo/transmission-bot.png?raw=true" alt="WebTorrent" width="200">
  <br>
  Transmission Bot for Telegram
  <br>
</h1>
<p align="center">Do you like the project? <a href="http://bit.ly/transmission-bot">Buy me a coffee or a beer 🍻</a></p>
So, you want to controll your torrent status from anywhere in the world, but you don't know how to do this, right? Here is the solution, this is a simple telegram bot that allows you to check the status of your torrents, add, stop, remove, briefly these are all the basic actions that you do with the program or web interface.

#### Summary:
* [List of available commands](#available-commands)
* [How to install it](#how-to-install-it)
* [Note](#note)
* [Bugs, support and suggestions](#report-bugs-or-suggestions)

## Available commands
* <b>List of all torrents</b>;
* <b>Torrent status</b> - Get all details about a torrent;
* <b>Torrent start</b> - Restart a torrent that is paused;
* <b>Torrent stop</b> - Stop a torrent;
* <b>Torrent remove</b> - Remove a torrent;
* <b>Add torrent</b> - Add a torrent from a <code>.torrent</code> file or from an url;

## How to install it
Clone the repository with <code>git clone https://github.com/raffaelecalza/transmission-telegram-bot.git</code> or download it as a zip file from [here](https://github.com/raffaelecalza/transmission-telegram-bot/releases/latest).
### 1) Register your bot name
First of all you have to register your bot's name. To do this, begin a new chat to <b>@BotFather</b>. Send <code>/newbot</code> command. Then send  to him the name of your bot (e.g. My Wonderful Bot). Then send a username for the bot (NOTE: this must end with the word 'bot'), e.g. MyWonderfulBot. After that the Bot Father will send you a message that contains the TOKEN for the bot. Save it because in the fourth step we'll use it.<br />
<img src="https://github.com/raffaelecalza/transmission-telegram-bot/blob/master/screenshot/1.jpg?raw=true" width="33%" /> <img src="https://github.com/raffaelecalza/transmission-telegram-bot/blob/master/screenshot/2.jpg?raw=true" width="33%" /> <img src="https://github.com/raffaelecalza/transmission-telegram-bot/blob/master/screenshot/3.jpg?raw=true" width="33%" />

### 2) Set bot commands (Optional)
This step is optional because the bot has a custom keyboard, but I suggest you to set the commands.
After you have register your bot and take the token you have to send to BotFather the full list of commands. Use the <code>/setcommands</code> and send this string to BotFather:<br />
```
torrentlist - Get the list of all torrents
torrentstatus - Get all details about a torrent
torrentadd - Add a torrent from url
torrentstart - Start a paused torrent
torrentstop - Stop a torrent
torrentremove - Remove a torrent
settings - Set your preferences
help - Get the list of available commands
```
<h4 align="center"><img src="https://github.com/raffaelecalza/transmission-telegram-bot/blob/master/screenshot/4.jpg?raw=true" width="33%" /></h4>
### 3) Install NodeJS, NPM and PM2
Go to the [next step](#4-configure-your-bot) if you have already installed NodeJS, NPM and PM2.
#### Install NodeJS and NPM
For Windows and OSX go to NodeJS site and download the installer (https://nodejs.org/en/download/). This also will install NPM.

For linux users, follow this guide (https://nodejs.org/en/download/package-manager/).
#### Install all project dependencies
Open up a terminal, go to your bot's folder and then run <code>npm install</code>.
#### Install PM2
For running your bot forever and as a daemon, you have to install a simple library called PM2 - Process Manager 2. So, Open a console and type <code>sudo npm install -g pm2</code>. If everything goes right try to type this command in the terminal <code>pm2 status</code>, and tou should see an empty list of applications.
### 4) Configure your bot
Now, open the config.json file with a text editor. Replace the token string with your bot's token. If you already know your chats id insert it in the array.
In the transmission section, insert the ip address of the computer where transmission is installed (localhost if the bot runs in the same machine). Insert your username and password if you've set it, otherwise leave this fileds empty (don't delete them). The last step is to specify the number of the port (if you have changed it).
```javascript
{
  "bot": {
      "token": "your bot's token",
      "users": [000000, 000000, 2222222]
  },
  "transmission": {
      "address": "your ip address",
      "credentials": {
          "username": "leave this empty if you doesn't have a username",
          "password": "leave this empty if you doesn't have a password"
      },
      "port": 9091
  }
}
```
If you don't know your chat id, open a terminal and go to your bot repo's folder, open the <code>bot/</code> folder then start your bot (after have installed all packages in the 3 step) with the command <code>node bot.js</code>. Try to send a message to your bot, you'll see in the console your chat id, hit <code>Ctrl + C</code> to stop the bot and insert your chat id in the config file.<br />
**NOTE: you must have inserted at least the bot token in the config file but i recommend you to configure also Transmission before running your bot.**
<h4 align="center"><img src="https://github.com/raffaelecalza/transmission-telegram-bot/blob/master/screenshot/5.gif?raw=true" /></h4>
### 5) Run your bot
Now you haven't to wait anymore, go to your bot folder and type <code>pm2 start bot.js</code>. Then your bot will start in background.
## NOTE
If you shutdown or reboot your PC, PM2 will stop your application so you have to re-run your bot every time with the command <code>pm2 start bot.js</code>.
## Report bugs or suggestions
If you have discovered a bug or if you have a suggestion, please open an issue or send me an email (raffaelecalza4@gmail.com)

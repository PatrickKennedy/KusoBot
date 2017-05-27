//@ts-check
/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

const bot    = new (require('discord.js')).Client();
const config = require('./config');

// the token of your bot - https://discordapp.com/developers/applications/me
const token = config.bot.discord_token;

// Bootstrap plugin framework on top of the Bot EventEmitter
new (require('morty').Bootstrapper)(bot);
bot.emit('load_plugin', ...config.bot.plugins);

// log our bot in
bot.login(token);

/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

// import the discord.js module
const Discord = require('discord.js')
    , moment  = require('moment-timezone')
    , rp      = require('request-promise')
    , config  = require('./config')
    ;

// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

// the token of your bot - https://discordapp.com/developers/applications/me
const token = config.bot.discord_token;

// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
bot.on('ready', () => {
  console.log('I am ready!');
  console.log(`I'm a part of these guilds:`);
  bot.guilds.forEach((guild) => {
    console.log(guild.name);
    guild.channels.find('name', config.bot.announce_channel).send('I liiiiive! Fear me!');
  });
});

bot.on('guildCreate', (guild) => {
  console.log('createGuild event');
  if (!guild.available)
    console.log(`${guild.name} is unavailable`);
  guild.channels.find('name', config.bot.announce_channel).send('I liiiiive! Fear me!');
});

// create an event listener for messages
bot.on('message', message => {
  if (message.content === '!ping') {
    message.channel.sendMessage('pong!');
  }

  if (message.content === '!upcoming') {
    let options = {
      method: 'GET',
      uri: `http://${config.services.host}:${config.services.port}/api/v1/`,
      json: true,
    };

    rp(options)
      .then((data) => {
        let next_event = data[0]
          , event_date = moment(data[0].date)
          , diff = event_date.fromNow(true)
          ;

        message.channel.sendMessage(`Next Event in ${diff} this ${event_date.format('dddd')}`);
        //message.channel.sendMessage(`Current Time: ${moment.tz('America/New_York').format('hh:mma z')}`);
        next_event.races.forEach((race, index) => {
          let race_start = moment.utc(race.start_time).tz('America/New_York')
          let game = race.game ? `${race.game} for the ${race.platform}` : `a ${race.platform} game`;
          message.channel.sendMessage(`${race_start.format('hh:mma z')} - ${race.racer_1} vs ${race.racer_2} playing ${game}`);
        });
      });
  }


  if (message.content === '!next') {
    let options = {
      method: 'GET',
      uri: `http://${config.services.host}:${config.services.port}/api/v1/`,
      json: true,
    };
    rp(options)
      .then((data) => {
        let next_race = data[0].races[0]
          , race_start = moment(next_race.start_time)
          , diff = race_start.fromNow(true)
          , game = race.game ? `${race.game} for the ${race.platform}` : `a ${race.platform} game`
          ;

        message.channel.sendMessage(`Next Race in ${diff}`);
        message.channel.sendMessage(`${race_start.format('hh:mma z')} - ${race.racer_1} vs ${race.racer_2} playing ${game}`);
      });
  }

  if (message.content === '!help') {
    message.channel.sendMessage('Type !next to see how long until the next race or !upcoming to get a shchedule of all races for the next event')
  }

  if (message.content === '!die')
    bot.destroy();
});

// log our bot in
bot.login(token);

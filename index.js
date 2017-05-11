//@ts-check
/*
  A ping pong bot, whenever you send "ping", it replies "pong".
*/

// import the discord.js module
const Discord = require('discord.js')
    , moment  = require('moment-timezone')
    , rp      = require('request-promise')
    , config  = require('./config')
    , winner_emoji = ["🏅", "👑", "💎", "🏆", "🎏"]
    ;

// create an instance of a Discord Client, and call it bot
const bot = new Discord.Client();

// the token of your bot - https://discordapp.com/developers/applications/me
const token = config.bot.discord_token;

function random_emoji(){
  return winner_emoji[Math.floor(winner_emoji.length * Math.random())]
}

// the ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted.
bot.on('ready', () => {
  let client_id = bot.user.id;
  console.log('I am ready!');
  console.log(`Add me to a guild by going to https://discordapp.com/oauth2/authorize?client_id=${client_id}&scope=bot&permissions=0`)
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

  if (message.content === '!next') {
    let options = {
      method: 'GET',
      uri: `http://${config.services.host}:${config.services.port}/api/v1/upcoming`,
      json: true,
    };
    rp(options)
      .then((data) => {
        if (!data.length || !data[0].races.length) {
          message.channel.sendMessage('No events currently scheduled')
          return;
        }

        // load the next future race if one exists
        let race = data[0].races.find((race) => { return moment.utc(race.start_time).isAfter(moment.utc()); });
        if (typeof race === "undefined") {
          message.channel.sendMessage('No races left today :(');
          return;
        }

        let race_start = moment.utc(race.start_time).tz('America/New_York')
          , diff = race_start.fromNow(true)
          , game = race.game ? `${race.game} [${race.platform}]` : `a ${race.platform} game`
          , racer_1 = race.racer_1.replace('\n', ' ')
          , racer_2 = race.racer_2.replace('\n', ' ')
          , messages = []
          ;

        message.channel.sendMessage(`Next Kusogrande Race in ${diff}`);
        messages.push('```markdown');
        messages.push(`* ${racer_1} -vs- ${racer_2}\n    Racing: ${game}\n    At:     ${race_start.format('hh:mma z')}\n`);
        messages.push('```');
        message.channel.sendMessage(messages.join('\n'));
      });
  }

  if (message.content === '!upcoming') {
    let options = {
      method: 'GET',
      uri: `http://${config.services.host}:${config.services.port}/api/v1/upcoming`,
      json: true,
    };

    rp(options)
      .then((data) => {
        if (!data.length || !data[0].races.length) {
          message.channel.sendMessage('No events currently scheduled')
          return;
        }

        let last_event = data[data.length - 1]
          , event_date = moment(data[0].date)
          , diff = event_date.fromNow(true)
          , messages = []
          ;

        message.channel.sendMessage(`Next Kusogrande Event in ${diff} this ${event_date.format('dddd')}`);
        //message.channel.sendMessage(`Current Time: ${moment.tz('America/New_York').format('hh:mma z')}`);
        messages.push('```markdown');
        last_event.races.forEach((race, index) => {
          let race_start = moment.utc(race.start_time).tz('America/New_York')
            , game = race.game ? `${race.game} [${race.platform}]` : `a ${race.platform} game`
            , racer_1 = race.racer_1.replace('\n', ' ')
            , racer_2 = race.racer_2.replace('\n', ' ')
            ;
          messages.push(`* ${racer_1} -vs- ${racer_2}\n    Racing: ${game}\n    At:     ${race_start.format('hh:mma z')}\n`);
        });
        messages.push('```');
        message.channel.sendMessage(messages.join('\n'));
      });
  }

  if (message.content === '!last') {
    let options = {
      method: 'GET',
      uri: `http://${config.services.host}:${config.services.port}/api/v1/past`,
      json: true,
    };

    rp(options)
      .then((data) => {
        let last_event = data[data.length - 1]
          , event_date = moment(last_event.date)
          , diff = event_date.fromNow(true)
          , messages = []
          ;

        messages.push(`Last Kusogrande Event ${diff} ago`);
        //messages.push(`Vods Available at <https://www.twitch.tv/brossentia/videos/highlights>`);
        messages.push('```markdown');
        last_event.races.forEach((race, index) => {
          let game = race.game ? `${race.game} [${race.platform}]` : `a ${race.platform} game`
            , racer_1 = (race.racer_1.includes(race.winner) ? `${race.winner}👑` : race.racer_1).replace('\n', ' ')
            , racer_2 = (race.racer_2.includes(race.winner) ? `${race.winner}💎` : race.racer_2).replace('\n', ' ')
            ;
          messages.push(`* ${racer_1} -vs- ${racer_2}\n    Raced: ${game}\n    Vod:   ${race.vod.replace('https://', '')}\n`);
        });
        messages.push('```');
        message.channel.sendMessage(messages.join('\n'));
      });
  }


  if (message.content === '!help')
    message.channel.sendMessage('Type !next to see how long until the next race, !upcoming to get a shchedule of all races for the next event, or !past to see the last most recent race');

  if (message.content === '!addme')
    message.channel.sendMessage(`https://discordapp.com/oauth2/authorize?client_id=${bot.user.id}&scope=bot&permissions=0`);

  if (message.content === '!die')
    bot.destroy();
});

// log our bot in
bot.login(token);

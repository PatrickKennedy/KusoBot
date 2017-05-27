const moment  = require('moment-timezone')
    , rp      = require('request-promise')
    , config  = require('../config')
    , winner_emoji = ["🏅", "👑", "💎", "🏆", "🎏"]
    ;

function random_emoji(){
  return winner_emoji[Math.floor(winner_emoji.length * Math.random())]
}

module.exports = class extends require('morty').Plugin {
  constructor(owner) {
    let name = __filename.slice(__dirname.length + 1, -3);
    super(name, owner);
    this.emit('loaded', this);
  }

  cmd_next(message, args) {
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

  cmd_upcoming(message, args) {
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

  cmd_last(message, args) {
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

}
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

  __build_game_msg(race) {
    return race.game ? `${race.game} [${race.platform}]` : race.platform ? `a ${race.platform} game` : 'a mystery game';
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
          message.channel.send('No events currently scheduled')
          return;
        }

        // load the next future race if one exists
        let race = data[0].races.find((race) => { return moment.utc(race.start_time).isAfter(moment.utc()); });
        if (typeof race === "undefined") {
          message.channel.send('No races left today :(');
          return;
        }

        let race_start = moment.utc(race.start_time).tz('America/New_York')
          , diff = race_start.fromNow(true)
          , game = this.__build_game_msg(race)
          , racer_1 = race.racer_1.replace('\n', ' ')
          , racer_2 = race.racer_2.replace('\n', ' ')
          , messages = []
          ;

        messages.push(`Next Kusogrande Race in ${diff}`);
        messages.push('```markdown');
        messages.push(`* ${racer_1} -vs- ${racer_2}\n    Racing: ${game}\n    At:     ${race_start.format('hh:mma z')}\n`);
        messages.push('```');
        message.channel.send(messages.join('\n'));
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
          message.channel.send('No events currently scheduled')
          return;
        }

        let next_event = data[0]
          // use the first race as the start time for the event to avoid cases
          // where !next and !upcoming have different days near the end of a day
          , first_race = (next_event && next_event.races[0])
          , first_race_time = moment(first_race ? first_race.start_time : next_event.date)
          , diff = first_race_time.fromNow(true)
          , messages = []
          ;

        messages.push(`Next Kusogrande Event in ${diff} this ${first_race_time.format('dddd')}`);
        //message.channel.send(`Current Time: ${moment.tz('America/New_York').format('hh:mma z')}`);
        messages.push('```markdown');
        next_event.races.forEach((race, index) => {
          let race_start = moment.utc(race.start_time).tz('America/New_York')
            , game = this.__build_game_msg(race)
            , racer_1 = race.racer_1.replace('\n', ' ')
            , racer_2 = race.racer_2.replace('\n', ' ')
            ;
          messages.push(`* ${racer_1} -vs- ${racer_2}\n    Racing: ${game}\n    At:     ${race_start.format('hh:mma z')}\n`);
        });
        messages.push('```');
        message.channel.send(messages.join('\n'));
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
          let game = this.__build_game_msg(race)
            , racer_1 = (race.racer_1.includes(race.winner) ? `${race.winner}👑` : race.racer_1).replace('\n', ' ')
            , racer_2 = (race.racer_2.includes(race.winner) ? `${race.winner}💎` : race.racer_2).replace('\n', ' ')
            ;
          messages.push(`* ${racer_1} -vs- ${racer_2}\n    Raced: ${game}\n    Vod:   ${race.vod.replace('https://', '')}\n`);
        });
        messages.push('```');
        message.channel.send(messages.join('\n'));
      });
  }

}
let config = require('../config');

/**
 * This discord specific Bootstrapper subclass hooks into the message event to
 * listen for incoming messages.
 */
module.exports = class Discord extends require('morty').Plugin {
  constructor(owner) {
    let name = __filename.slice(__dirname.length + 1, -3);
    super(name, owner);
    this.registerEventTrap(this.ready);
    this.registerEventTrap(this.guildCreate);
    this.registerEventTrap(this.message);
    this.emit('loaded', this);
  }

  // the ready event is vital, it means that your bot will only start reacting to information
  // from Discord _after_ ready is emitted.
  ready() {
    let bot = this.owner;
    let client_id = bot.user.id;
    console.log('I am ready!');
    console.log(`Add me to a guild by going to https://discordapp.com/oauth2/authorize?client_id=${client_id}&scope=bot&permissions=0`)
    console.log(`I'm a part of these guilds:`);
    bot.guilds.forEach((guild) => {
      console.log(guild.name);
      // [
      //   'Hello. I am, KusoBot. Your personal Kuso companion. I was alerted to the need for kusoge attention when you said "oh no". On a scale from 1-10 how would you rate your pain?',
      //   'Use !help to see available commands (WIP)! Or just get started with !upcoming and !past.'
      // ].map((msg) => { guild.channels.find('name', config.bot.announce_channel).send(msg); })
    });
  }

  guildCreate(guild) {
    console.log('createGuild event');
    if (!guild.available)
      console.log(`${guild.name} is unavailable`);
    [
      'Hello. I am, KusoBot. Your personal Kuso companion. I was alerted to the need for kusoge attention when you said "oh no". On a scale from 1-10 how would you rate your pain?',
      'Use !help to see available commands (WIP)! Or just get started with !upcoming and !past.'
    ].map((msg) => { guild.channels.find('name', config.bot.announce_channel).send(msg); })
  }

  /**
   * Handle messages, specifically processing namespaced commands
   * @param {string} message
   */
  message(message) {
    if (message.author.id === this.owner.id)
      return;

    console.log(`[message] Received Message: ${message}`);
    let content = message.content;
    if(content.startsWith('!')) {
      let [cmd, ...args] = content.split(' ');
      cmd = cmd.substr(1).toLowerCase();
      args = args.join(' ');
      this.emit(`cmd:${cmd}`, message, args);
    }
  }
}

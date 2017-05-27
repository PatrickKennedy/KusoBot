module.exports = class extends require('morty').Plugin {
  constructor(owner) {
    let name = __filename.slice(__dirname.length + 1, -3);
    super(name, owner);
    this.emit('loaded', this);
  }

  cmd_help(msg) {
    msg.author.send('Type !next to see how long until the next race, !upcoming to get a schedule of all races for the next event, or !past to see the last most recent race');
  }

  cmd_addme(msg) {
    msg.channel.send(`https://discordapp.com/oauth2/authorize?client_id=${this.owner.user.id}&scope=bot&permissions=0`);
  }

  cmd_addme(msg) {
    msg.author.send(':(');
    this.owner.destroy();
  }
}
module.exports = class extends require('morty').Plugin {
  constructor(owner) {
    let name = __filename.slice(__dirname.length + 1, -3);
    super(name, owner);
    this.emit('loaded', this);
  }

  cmd_hello(msg, name) {
    msg.channel.send(`Hello, ${name}`);
  }
}
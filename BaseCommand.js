const Bot = require("./Bot");

module.exports = class BaseCommand {
  static prefix = "w.";
  static command = "Command to be used";
  static helpTitle = "BaseCommand";
  static helpDescription = "Command to be extended";

  constructor(message, args) {
    this.message = message;
    this.args = args;
    this.client = Bot.client;
    this.db = Bot.db;
  }

  async execute() {
    console.log("Execute command");
  }

  async reply(text, mention=false) {
    if (mention) {
      return this.message.reply(text)
    }
    return this.message.channel.send(text)
  }

}
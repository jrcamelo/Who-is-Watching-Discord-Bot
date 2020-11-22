const Bot = require("../Bot");

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
    this.reactionEmote = "779800410168098816";

    this.addWatchingReaction();
  }

  addWatchingReaction() {
    this.message.react(this.reactionEmote);
  }

  async tryExecute() {
    try {
      await this.execute();
    } catch(e) {
      console.log("\n" + this.message.content + " caused an error at " + new Date())
      console.log(e);
      console.log("\n")
    }
  }

  async execute() {
    console.log("Invalid command: " + this.message.content);
  }

  async reply(text, mention=false) {
    if (mention) {
      return this.message.reply(text)
    }
    return this.message.channel.send(text)
  }

}
const Bot = require("../Bot");

class BaseCommand {
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
    this.addWatchingReactionToMessage();

    this.reactions = {
      "❌": this.deleteReply,      
    }
    this.reactionFilter = (reaction, user) => {
      console.log(reaction.emoji.name);
      return this.reactions[reaction.emoji.name] != null;
    };
  }

  addWatchingReactionToMessage() {
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

  async waitReplyReaction() {
    const options = { max: 1, time: 30000, errors: ['time'] };
    this.reply.awaitReactions(this.reactionFilter, options)
      .then(collected => {
          this.reactions[collected.first().emoji](collected.first()); 
        })
      .catch(collected => {});
  }

  async deleteReply(collected) {
    collected.message.delete();
  }

  async reply(text, mention=false) {
    this.reply = mention ?
      await this.message.reply(text)
      : await this.message.channel.send(text)
    await this.waitReplyReaction();
    return this.reply;    
  }
}
module.exports = BaseCommand;
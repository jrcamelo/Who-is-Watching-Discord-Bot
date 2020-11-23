const Bot = require("../Bot");
const User = require("../User");

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
    const options = { max: 1, time: 60000, errors: ['time'] };
    this.reply.awaitReactions(this.reactionFilter, options)
      .then(collected => {
          this.reactions[collected.first().emoji](collected.first()); 
        })
      .catch(collected => {});
  }

  async deleteReply(collected) {
    collected.message.delete();
  }

  async reply(botMessage, mention=false) {
    if (botMessage && typeof(botMessage) != typeof("")) {
      botMessage.footer = this.addCommandFooter(botMessage);
      try { await this.message.delete(); } catch(e) { }
    }
    
    this.reply = mention ?
      await this.message.reply(botMessage)
      : await this.message.channel.send(botMessage)
    await this.waitReplyReaction();
    return this.reply;    
  }

  addCommandFooter(botMessage) {
    if (!botMessage.footer) {
      return { 
        text: `"${this.message.content}" by ${this.message.author.username}`,
        iconURL: User.makeDiscordAvatarUrl(this.message.author) 
      }
    }

    botMessage.footer.text += ` - "${this.message.content}" sent by ${this.message.author.username}`;
    if (!botMessage.footer.iconURL) {
      botMessage.footer.iconURL = User.makeDiscordAvatarUrl(this.message.author);
    }
    return botMessage.footer;    
  }
}
module.exports = BaseCommand;
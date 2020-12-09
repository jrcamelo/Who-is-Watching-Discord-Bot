const Bot = require("../Bot");
const User = require("../User");
const { getGuildIdOrUserId } = require("../Utils");

class BaseCommand {
  static prefix = "w.";
  static command = "Command to be used";
  static helpTitle = "BaseCommand";
  static helpDescription = "Command to be extended";

  static deleteReactionEmoji = "💥";
  static previousReactionEmoji = "⬅️";
  static nextReactionEmoji = "➡️";


  constructor(message, args) {
    this.message = message;
    this.args = args;
    this.client = Bot.client;
    this.db = Bot.db;
    this.guildId = getGuildIdOrUserId(message);

    this.reactionEmote = "779800410168098816";
    // this.addWatchingReactionToMessage();

    this.reactions = {
      [BaseCommand.deleteReactionEmoji]: this.deleteReply,      
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
    this.message.channel.startTyping();
    try {
      await this.execute();
    } catch(e) {
      console.log("\n" + this.message.content + " caused an error at " + new Date())
      console.log(e);
      console.log("\n")
    }
    this.message.channel.stopTyping();
  }

  async execute() {
    console.log("Invalid command: " + this.message.content);
  }

  async waitReplyReaction() {
    const options = { max: 1, time: 120000, errors: ['time'] };
    this.reply.awaitReactions(this.reactionFilter, options)
      .then(collected => {
          this.reactions[collected.first().emoji](collected.first(), this); 
        })
      .catch(collected => {});
  }

  async deleteReply(collected, _command) {
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
    await this.addDeleteReactionToReply();
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

  async makeAnilistUserFromMessageOrMention() {
    if (!this.message) { 
      return false;
    }
    const user = new User();
    if (this.isArgsBlank()) {
      await user.setDiscordFromMessage(this.message);
      if (!await user.setAniListFromDiscord()) {
        await this.reply("AniList user not found, maybe you need to link your account with w.link <Your AniList username>");
        return false;
      }
    } else {
      const id = this.args.join(" ");
      await user.setDiscordFromSearch(this.message, id);
      if (!await user.setAniListFromDiscord()) {
        await this.reply("AniList user not found, maybe they need to link their account with w.link <AniList username> or your mention failed.");
        return false;
      }
    }
    return user;
  }

  addDeleteReactionToReply() {
    return this.reply.react(BaseCommand.deleteReactionEmoji);
  }
  
  isArgsBlank() {
    return !this.args.length;
  }
}
module.exports = BaseCommand;
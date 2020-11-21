const BaseCommand = require("../BaseCommand.js");
const User = require("../User");

class List extends BaseCommand {
  static command = "list";
  static helpTitle = "Shows a mentioned user's linked AniList account.";
  static helpDescription = `${BaseCommand.prefix + this.command} <@User>`

  constructor(message, args) {
    super(message, args);
  }

  async execute() {
    const user = new User();
    await user.setDiscordFromMention(this.message);
    if (!await user.setAniListFromDiscord()) {
      return this.reply("AniList user not found, maybe they need to link their account with w.link <AniList username>");
    }
    const embed = user.makeAniListProfileEmbed();  
    return this.reply(embed);
  }  
}
module.exports = List;
const BaseCommand = require("../BaseCommand.js");
const User = require("../User");

class Me extends BaseCommand {
  static command = "me";
  static helpTitle = "Shows your linked AniList account.";
  static helpDescription = `${BaseCommand.prefix + this.command}`

  constructor(message, args) {
    super(message, args);
  }

  async execute() {
    const user = new User();
    await user.setDiscordFromMessage(this.message);
    if (!await user.setAniListFromDiscord()) {
      return this.reply("AniList user not found, maybe you need to link your account with w.link <Your AniList username>");
    }
    const embed = user.makeAniListProfileEmbed();  
    return this.reply(embed);
  }  
}
module.exports = Me;
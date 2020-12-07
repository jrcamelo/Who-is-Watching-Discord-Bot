const BaseCommand = require("./Base.js");
const User = require("../User");

class ProfileCommand extends BaseCommand {
  static command = "profile";
  static helpTitle = "Shows the user's or a mentioned user's linked AniList account.";
  static helpDescription = `${BaseCommand.prefix + this.command} [<@User or ID>]`

  constructor(message, args) {
    super(message, args);
  }

  async execute() {
    const user = new User();
    if (this.isArgsBlank()) {
      await user.setDiscordFromMessage(this.message);
      if (!await user.setAniListFromDiscord()) {
        return this.reply("AniList user not found, maybe you need to link your account with w.link <Your AniList username>");
      }
    } else {
      const id = this.args.join(" ");
      await user.setDiscordFromSearch(this.message, id);
      if (!await user.setAniListFromDiscord()) {
        return this.reply("AniList user not found, maybe they need to link their account with w.link <AniList username> or your mention failed.");
      }
    }

    const embed = user.makeAniListProfileEmbed();  
    return this.reply(embed);
  }
}
module.exports = ProfileCommand;
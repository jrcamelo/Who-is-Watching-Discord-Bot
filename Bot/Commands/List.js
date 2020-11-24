const BaseCommand = require("./Base.js");
const User = require("../User");

class ListCommand extends BaseCommand {
  static command = "list";
  static helpTitle = "Shows a mentioned user's linked AniList account.";
  static helpDescription = `${BaseCommand.prefix + this.command} <@User or ID>`

  constructor(message, args) {
    super(message, args);
  }

  async execute() {
    const user = new User();
    const id = this.args.join(" ");
    await user.setDiscordFromSearch(this.message, id);
    if (!await user.setAniListFromDiscord()) {
      return this.reply("AniList user not found, maybe they need to link their account with w.link <AniList username> or your mention failed.");
    }
    const embed = user.makeAniListProfileEmbed();  
    return this.reply(embed);
  }  
}
module.exports = ListCommand;
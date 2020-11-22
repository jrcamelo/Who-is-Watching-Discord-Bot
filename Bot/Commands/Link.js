const BaseCommand = require("./Base.js");
const User = require("../User");

class LinkCommand extends BaseCommand {
  static command = "link";
  static helpTitle = "Link your Discord account to an AniList account.";
  static helpDescription = `${BaseCommand.prefix + this.command} <Your AniList username>`

  constructor(message, args) {
    super(message, args);
  }

  async execute() {
    if (!this.args.length) {
      return this.reply("Add your AniList username after the command\n" + LinkCommand.helpDescription)
    }

    const user = new User();
    await user.setDiscordFromMessage(this.message);
    const anilistUsername = this.args.join("").trim();
    if (!await user.setAniListFromUsername(anilistUsername)) {
      return this.reply("Could not find AniList user with username: " + anilistUsername);
    }

    const embed = user.makeAniListProfileEmbed();  
    await user.saveLinkedUser();
    return this.reply(embed);
  }  
}
module.exports = LinkCommand;
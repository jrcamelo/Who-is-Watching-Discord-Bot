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
    if (this.message.guild == null) {
      return this.reply("This command does not work on DMs");
    }

    this.user = new User();
    await this.user.setDiscordFromMessage(this.message);
    if (!this.args.length) {
      return this.noArgs()
    }

    const anilistUsername = this.args.join("").trim();
    if (!await this.user.setAniListFromUsername(anilistUsername)) {
      return this.reply("Could not find AniList user with username: " + anilistUsername);
    }
    await this.user.saveLinkedUser();
    await this.user.saveUserToGuild();
    return this.makeEmbed();
  }

  async noArgs() {
    if (await this.user.setAniListFromDiscord() == null) {
      return this.reply("Add your AniList username after the command\n" + LinkCommand.helpDescription)
    }
    await this.user.saveUserToGuild();
    return this.makeEmbed();
  }

  async makeEmbed() {
    const embed = this.user.makeAniListProfileEmbed();
    return this.reply(embed);
  }

}
module.exports = LinkCommand;
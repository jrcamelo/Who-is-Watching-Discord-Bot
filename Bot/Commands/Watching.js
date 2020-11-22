const BaseCommand = require("./Base.js");
const Watching = require("../Watching");
const User = require("../User");

class WatchingCommand extends BaseCommand {
  static command = "eps";
  static helpTitle = "Lists the next episodes of animes the user is watching.";
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
    const watching = new Watching(user);
    if (await watching.getEpisodes() == null) {
      return this.reply("Either you are not watching any anime or there was an error somewhere.");
    }
    const embed = watching.makeEmbed();
    return this.reply(embed)
  }
}
module.exports = WatchingCommand;
const BaseCommand = require("./Base.js");
const Watching = require("../Watching");
const User = require("../User");

class WatchingCommand extends BaseCommand {
  static command = "watching";
  static helpTitle = "Lists the next episodes of anime the user is watching.";
  static helpDescription = `${BaseCommand.prefix + this.command} [<@user>]`

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
    const watching = new Watching(user);
    if (await this.getEpisodes(watching) == null) {
      return this.reply("Either you are not watching any anime or there was an error somewhere.");
    }
    const embed = watching.makeEmbed();
    return this.reply(embed)
  }

  async getEpisodes(watching) {
    return await watching.getEpisodes();
  }
}
module.exports = WatchingCommand;
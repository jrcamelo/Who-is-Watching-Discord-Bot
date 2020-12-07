const BaseCommand = require("./Base");
const WatchingCommand = require("./Watching");

class WatchingAiringCommand extends WatchingCommand {
  static command = "airing";
  static helpTitle = "Lists the next episodes of airing anime the user is watching.";
  static helpDescription = `${BaseCommand.prefix + this.command} [<@user>]`

  constructor(message, args) {
    super(message, args);
  }

  async getEpisodes(watching) {
    return await watching.getAiringEpisodes();
  }
}
module.exports = WatchingAiringCommand;
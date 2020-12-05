const BaseCommand = require("./Base.js");
const WatchList = require("../WatchList");

class WatchListCommand extends BaseCommand {
  static command = "watchlist";
  static helpTitle = "Lists the airing anime that all users are watching.";
  static helpDescription = `${BaseCommand.prefix + this.command}`

  constructor(message, args) {
    super(message, args);
  }

  async execute() {
    this.watchlist = new WatchList();
    await this.watchlist.getWatchingAnime();
    this.reply(this.watchlist.makeEmbed());
  }
}
module.exports = WatchListCommand;
const BaseCommand = require("./Base.js");
const Anime = require("../Anime");

class AnimeCommand extends BaseCommand {
  static command = "anime";
  static helpTitle = "Searches for an anime and shows users that are watching or have watched it.";
  static helpDescription = `${BaseCommand.prefix + this.command} <Anime title>`

  constructor(message, args) {
    super(message, args);
  }

  async execute() {
    if (!this.args || this.args.length < 1) {
      return this.reply("Try adding part of a title of an anime, as such: " + this.helpDescription);
    }

    const title = this.args.join(" ");
    const anime = new Anime(title);
    if (await anime.search() == null) {
      return this.reply("Something went wrong or no anime with that title was found!");
    }
    const embed = await anime.makeEmbed();
    return this.reply(embed);    
  }
}
module.exports = AnimeCommand;
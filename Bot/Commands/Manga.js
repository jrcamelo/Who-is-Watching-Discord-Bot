const BaseCommand = require("./Base.js");
const Manga = require("../Manga");

class MangaCommand extends BaseCommand {
  static command = "manga";
  static helpTitle = "Searches for a manga and shows users that are reading or have read it.";
  static helpDescription = `${BaseCommand.prefix + this.command} <Manga title>`

  constructor(message, args) {
    super(message, args);
    this.compact = false;
  }

  async execute() {
    if (!this.args || this.args.length < 1) {
      return this.reply("Try adding part of a title of a manga, as such: " + this.helpDescription);
    }

    const title = this.args.join(" ");
    const manga = new Manga(title);
    if (await manga.search() == null) {
      return this.reply("Something went wrong or no manga with that title was found!");
    }
    const embed = await this.getMangaEmbed(manga);
    return this.reply(embed);    
  }

  async getMangaEmbed(manga) {
    return manga.makeEmbed();
  }
}
module.exports = MangaCommand;
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
    this.manga = new Manga(title, this.guildId);
    if (await this.manga.search() == null) {
      return this.reply("Something went wrong or no manga with that title was found!");
    }
    const embed = await this.getMangaEmbed();
    this.botMessage = await this.reply(embed);

    if (this.manga.searchResult.length > 1) {
      await this.addPreviousAndNextReactions();
    }
  }

  async addPreviousAndNextReactions() {
    await this.botMessage.react(BaseCommand.previousReactionEmoji);
    await this.botMessage.react(BaseCommand.nextReactionEmoji);
    this.reactions[BaseCommand.previousReactionEmoji] = this.previousManga;
    this.reactions[BaseCommand.nextReactionEmoji] = this.nextManga;
  }

  async previousManga(_collected, command) {
    if (!command.manga.previousSearchResult()) return;
    await command.refreshManga();
  }

  async nextManga(_collected, command) {
    if (!command.manga.nextSearchResult()) return;
    await command.refreshManga();
  }

  async refreshManga() {
    const embed = await this.getMangaEmbed();
    await this.botMessage.edit(embed);
    await this.waitReplyReaction();
  }

  async getMangaEmbed() {
    return this.manga.makeEmbed();
  }
}
module.exports = MangaCommand;
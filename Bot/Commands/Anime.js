const BaseCommand = require("./Base.js");
const Anime = require("../Anime");

class AnimeCommand extends BaseCommand {
  static command = "anime";
  static helpTitle = "Searches for an anime and shows users that are watching or have watched it.";
  static helpDescription = `${BaseCommand.prefix + this.command} <Anime title>`

  constructor(message, args) {
    super(message, args);
    this.compact = false;
  }

  async execute() {
    if (!this.args || this.args.length < 1) {
      return this.reply("Try adding part of a title of an anime, as such: " + this.helpDescription);
    }

    const title = this.args.join(" ");
    this.anime = new Anime(title, this.guildId);
    if (await this.anime.search() == null) {
      return this.reply("Something went wrong or no anime with that title was found!");
    }
    const embed = await this.getAnimeEmbed();
    this.botMessage = await this.reply(embed);

    if (this.anime.searchResult.length > 1) {
      await this.addPreviousAndNextReactions();
    }
  }

  async addPreviousAndNextReactions() {
    await this.botMessage.react(BaseCommand.previousReactionEmoji);
    await this.botMessage.react(BaseCommand.nextReactionEmoji);
    this.reactions[BaseCommand.previousReactionEmoji] = this.previousAnime;
    this.reactions[BaseCommand.nextReactionEmoji] = this.nextAnime;
  }

  async previousAnime(_collected, command) {
    if (!command.anime.previousSearchResult()) return;
    await command.refreshAnime();
  }

  async nextAnime(_collected, command) {
    if (!command.anime.nextSearchResult()) return;
    await command.refreshAnime();
  }

  async refreshAnime() {
    const embed = await this.getAnimeEmbed();
    await this.botMessage.edit(embed);
    await this.waitReplyReaction();
  }

  async getAnimeEmbed() {
    return this.anime.makeEmbed();
  }
}
module.exports = AnimeCommand;
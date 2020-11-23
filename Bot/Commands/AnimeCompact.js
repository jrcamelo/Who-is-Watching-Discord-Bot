const AnimeCommand = require("./Anime");

class AnimeCompactCommand extends AnimeCommand {
  static command = "a";

  constructor(message, args) {
    super(message, args);
  }
  
  async getAnimeEmbed() {
    return this.anime.makeEmbedCompact();
  }
}
module.exports = AnimeCompactCommand;
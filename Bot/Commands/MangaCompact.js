const MangaCommand = require("./Manga");

class MangaCompactCommand extends MangaCommand {
  static command = "m";

  constructor(message, args) {
    super(message, args);
  }

  async getMangaEmbed(manga) {
    return manga.makeEmbedCompact();
  }
}
module.exports = MangaCompactCommand;
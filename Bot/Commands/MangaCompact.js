const MangaCommand = require("./Manga");

class MangaCompactCommand extends MangaCommand {
  static command = "m";

  constructor(message, args) {
    super(message, args);
  }

  async getMangaEmbed() {
    return this.manga.makeEmbedCompact();
  }
}
module.exports = MangaCompactCommand;
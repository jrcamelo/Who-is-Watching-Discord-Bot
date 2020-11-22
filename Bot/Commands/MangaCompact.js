const MangaCommand = require("./Manga");

class MangaCompactCommand extends MangaCommand {
  static command = "m";

  constructor(message, args) {
    super(message, args);
    this.compact = true;
  }
}
module.exports = MangaCompactCommand;
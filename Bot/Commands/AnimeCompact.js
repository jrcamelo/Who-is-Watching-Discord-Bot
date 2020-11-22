const AnimeCommand = require("./Anime");

class AnimeCompactCommand extends AnimeCommand {
  static command = "a";

  constructor(message, args) {
    super(message, args);
    this.compact = true;
  }
}
module.exports = AnimeCompactCommand;
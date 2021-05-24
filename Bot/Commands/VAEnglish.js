const VACommand = require("./VA");

class VAEnglishCommand extends VACommand {
  static command = "vadub";
  static helpTitle = "Searches for characters with the same Voice Actor as a given character, but in English.";

  constructor(message, args) {
    super(message, args);
    this.language = "ENGLISH";
  }
}
module.exports = VAEnglishCommand;

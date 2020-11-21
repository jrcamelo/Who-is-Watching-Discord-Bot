class Parser {
  static prefix = "w."
  constructor(message) {
    this.message = message;
  }

  static isValidMessage(message) {
    if (message.author.bot) return false;
    if (!message.content.startsWith(Parser.prefix)) return false;
    return true;
  }

  parse() {
    const Link = require("./Commands/Link");
    const Me = require("./Commands/Me");
    const List = require("./Commands/List");
    const Anime = require("./Commands/Anime");

    this.separateCommandAndArgs();

    switch(this.command) {
      case Link.command:
        return new Link(this.message, this.args)
        break;
      case Me.command:
        return new Me(this.message)
        break;
      case List.command:
        return new List(this.message, this.args)
        break;
      case Anime.command:
        return new Anime(this.message, this.args);
        break;
      default:
        break;
    }
  }

  separateCommandAndArgs() {
    const commandBody = this.removePrefix();
    this.args = commandBody.split(' ');
    if (this.args.length > 1) {
      this.command = this.args.shift().toLowerCase();
    }
    else {
      this.command = this.args[0]
      this.args = [];
    }
  }

  removePrefix() {
    return this.message.content.slice(Parser.prefix.length);
  }
}
module.exports = Parser
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
    const Help = require("./Commands/Help")
    const Link = require("./Commands/Link");
    const Me = require("./Commands/Me");
    const List = require("./Commands/List");
    const Anime = require("./Commands/Anime");
    const Manga = require("./Commands/Manga");
    const commands = [Link, Me, List, Anime, Manga];

    this.separateCommandAndArgs();

    switch(this.command) {
      case Help.command:
        return new Help(this.message, commands);
        break;
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
      case Manga.command:
        return new Manga(this.message, this.args);
        break;
      default:
        break;
    }
  }

  // Add a w.airing command
  // https://anilist.co/graphiql?query=%7B%0A%0A%20%20Page(page%3A1%2C%20perPage%3A10)%7B%0A%20%20%20%20media(seasonYear%3A%202020%2C%20season%3AFALL%2C%20sort%3A%20SCORE_DESC%2C%20status%3A%20RELEASING)%20%7B%20%20%20%20%20%20%0A%20%20%20%20%20%20nextAiringEpisode%20%7B%0A%20%20%20%20%20%20%20%20episode%0A%20%20%20%20%20%20%20%20timeUntilAiring%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20title%20%7B%0A%20%20%20%20%20%20%20%20romaji%0A%20%20%20%20%20%20%7D%20%20%20%20%20%20%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A%0A

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
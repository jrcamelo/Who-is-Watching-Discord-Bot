class Parser {
  static prefix = "w."
  constructor(message) {
    this.message = message;
  }

  static isValidMessage(message) {
    if (message.author.bot) return false;
    if (!message.content.toLowerCase().startsWith(Parser.prefix)) return false;
    return true;
  }

  parse() {
    const Help = require("./Commands/Help")
    const Link = require("./Commands/Link");
    const Profile = require("./Commands/Profile");
    const ProfileCompact = require("./Commands/ProfileCompact");
    const Anime = require("./Commands/Anime");
    const AnimeCompact = require("./Commands/AnimeCompact");
    const Manga = require("./Commands/Manga");
    const MangaCompact = require("./Commands/MangaCompact");
    const Watching = require("./Commands/Watching");
    const WatchingAiring = require("./Commands/WatchingAiring");
    const Feed = require("./Commands/Feed");
    const Notice = require("./Commands/Notice");
    const Trace = require("./Commands/Trace");
    const Sauce = require("./Commands/Sauce");
    const commands = [Link, 
                      Profile, 
                      Anime, 
                      Manga, 
                      Watching, 
                      WatchingAiring, 
                      Feed, 
                      Trace, 
                      Sauce];

    this.separateCommandAndArgs();

    switch(this.command.toLowerCase()) {
      case Help.command:
        return new Help(this.message, commands);
        break;
      case Link.command:
        return new Link(this.message, this.args)
        break;
      case Profile.command:
        return new Profile(this.message, this.args)
        break;
      case ProfileCompact.command:
        return new ProfileCompact(this.message, this.args)
        break;
      case Anime.command:
        return new Anime(this.message, this.args);
        break;
      case AnimeCompact.command:
        return new AnimeCompact(this.message, this.args);
        break;
      case Manga.command:
        return new Manga(this.message, this.args);
        break;
      case MangaCompact.command:
        return new MangaCompact(this.message, this.args);
        break;
      case Watching.command:
        return new Watching(this.message, this.args);
        break;
      case WatchingAiring.command:
        return new WatchingAiring(this.message, this.args);
        break;
      case Feed.command:
        return new Feed(this.message, this.args);
        break;
      case Notice.command:
        return new Notice(this.message);
        break;
      case Trace.command:
        return new Trace(this.message, this.args);
        break;
      case Sauce.command:
        return new Sauce(this.message, this.args);
        break;
      default:
        break;
    }
  }
  
  async isUserMod() {
    const member = await this.message.guild.member(this.message.author);
    if (member) return await member.hasPermission("MANAGE_MESSAGES");
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
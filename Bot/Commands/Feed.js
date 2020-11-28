const BaseCommand = require("./Base.js");
const Activities = require("../Activities");

class FeedCommand extends BaseCommand {
  static command = "feed";
  static helpTitle = "Returns a list of the last activities from linked users.";
  static helpDescription = `${BaseCommand.prefix + this.command} [<a> or <m>]`

  constructor(message, args) {
    super(message, args);
    this.type = Activities.type.MEDIA;
    if (args.length) {
      if (args[0].toLowerCase().startsWith("a")) {
        this.type = Activities.type.ANIME;
      }
      else if (args[0].toLowerCase().startsWith("m")) {
        this.type = Activities.type.MANGA;
      }
    }
  }

  async execute() {
    this.feed = new Activities(this.type);
    if (await this.feed.getLastActivities() == null) {
      return this.reply("Something went wrong or nobody is linked!");
    }

    const embed = await this.feed.makeEmbed();
    this.botMessage = await this.reply(embed);
    await this.addPreviousAndNextReactions();
  }


  async addPreviousAndNextReactions() {
    await this.botMessage.react(BaseCommand.previousReactionEmoji);
    await this.botMessage.react(BaseCommand.nextReactionEmoji);
    this.reactions[BaseCommand.previousReactionEmoji] = this.previous;
    this.reactions[BaseCommand.nextReactionEmoji] = this.next;
  }

  async previous(_collected, command) {
    if (await !command.feed.getPreviousPage()) return;
    return await command.refreshEmbed();
  }

  async next(_collected, command) {
    if (await !command.feed.getNextPage()) return;
    return await command.refreshEmbed();
  }

  async refreshEmbed() {
    const embed = await this.feed.makeEmbed();
    await this.botMessage.edit(embed);
    await this.waitReplyReaction();
  }
}
module.exports = FeedCommand;
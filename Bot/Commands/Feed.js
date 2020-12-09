const BaseCommand = require("./Base.js");
const Activities = require("../Activities");
const User = require("../User");

class FeedCommand extends BaseCommand {
  static command = "feed";
  static helpTitle = "Returns a list of the last activities from linked users.";
  static helpDescription = `${BaseCommand.prefix + this.command} [<a> or <m> or <@user>]`

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
    if (this.message.guild == null) {
      return this.reply("This command does not work on DMs");
    }

    this.mention = new User();
    if (await this.mention.setDiscordFromMention(this.message) &&
        await this.mention.setAniListFromDiscord()) {
      this.mentionId = this.mention.anilist.id;
    }

    this.feed = new Activities(this.type, this.guildId, this.mentionId);
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
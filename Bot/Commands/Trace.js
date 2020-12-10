const BaseCommand = require("./Base.js");
const Discord = require("discord.js");
const TraceMoe = require("../TraceMoe");
const AnimeCompact = require("./AnimeCompact")

class TraceCommand extends BaseCommand {
  static command = "what";
  static helpTitle = "Uses trace.moe to try to find the anime from an attached or linked screenshot.";
  static helpDescription = `${BaseCommand.prefix + this.command} {Anime Screenshot}`

  static checkEmoji = "✅";

  constructor(message, args) {
    super(message, args);
  }

  async execute() {
    if (this.message.guild == null) {
      return this.reply("This command does not work on DMs");
    }

    this.trace = new TraceMoe(this.message, this.args.join(" "));
    if (!(await this.trace.setImage())) {
      return this.reply("Could not find a screenshot.");
    }
    if (!(await this.trace.searchWithImage())) {
      return this.reply("There was a problem with the search on trace.moe. Maybe we hit the 10 searches per minute limit.")
    }
    const embed = await this.getEmbed();
    this.botMessage = await this.reply(embed);

    if (this.trace.searchResult.length > 1) {
      await this.addPreviousAndNextReactions();
      await this.addFoundReaction();
    }
  }

  async addPreviousAndNextReactions() {
    await this.botMessage.react(BaseCommand.previousReactionEmoji);
    await this.botMessage.react(BaseCommand.nextReactionEmoji);
    this.reactions[BaseCommand.previousReactionEmoji] = this.previousAnime;
    this.reactions[BaseCommand.nextReactionEmoji] = this.nextAnime;
  }

  async previousAnime(_collected, command) {
    if (!command.trace.previousSearchResult()) return;
    await command.refresh();
  }

  async nextAnime(_collected, command) {
    if (!command.trace.nextSearchResult()) return;
    await command.refresh();
  }

  async refresh() {
    const embed = await this.getEmbed();
    await this.botMessage.edit(embed);
    await this.waitReplyReaction();
  }

  async addFoundReaction() {
    await this.botMessage.react(TraceCommand.checkEmoji);
    this.reactions[TraceCommand.checkEmoji] = this.foundAnime;
  }

  async foundAnime(_collected, command) {
    command.message.content = TraceCommand.checkEmoji;
    return new AnimeCompact(command.message, [command.trace.getTitle()]).tryExecute();
  }
  
  async getEmbed() {
    return this.trace.makeEmbed();
  }
}
module.exports = TraceCommand;

const BaseCommand = require("./Base.js");
const SauceNao = require("../SauceNao");

class SauceCommand extends BaseCommand {
  static command = "sauce";
  static helpTitle = "Uses sauce.nao to find the source for an attached or linked image.";
  static helpDescription = `${BaseCommand.prefix + this.command}`

  constructor(message, args) {
    super(message, args);
  }

  async execute() {
    if (this.message.guild == null) {
      return this.reply("This command does not work on DMs");
    }

    this.sauce = new SauceNao(this.message, this.args.join(" "));
    if (!(await this.sauce.setImage())) {
      return this.reply("Could not find an image.");
    }
    if (!(await this.sauce.search())) {
      return this.reply("Could not find sauce. Maybe there was an error or we hit the 6 searches per 30 seconds limit.")
    }
    this.message.content = "w.sauce";
    const embed = await this.getEmbed();
    this.botMessage = await this.reply(embed);
    
    if (this.sauce.searchResult.length > 1) {
      await this.addPreviousAndNextReactions();
    }
  }
  
  async addPreviousAndNextReactions() {
    await this.botMessage.react(BaseCommand.previousReactionEmoji);
    await this.botMessage.react(BaseCommand.nextReactionEmoji);
    this.reactions[BaseCommand.previousReactionEmoji] = this.previousSauce;
    this.reactions[BaseCommand.nextReactionEmoji] = this.nextSauce;
  }

  async previousSauce(_collected, command) {
    if (!command.sauce.previousSearchResult()) return;
    await command.refresh();
  }

  async nextSauce(_collected, command) {
    if (!command.sauce.nextSearchResult()) return;
    await command.refresh();
  }

  async refresh() {
    const embed = await this.getEmbed();
    await this.botMessage.edit(embed);
    await this.waitReplyReaction();
  }

  async getEmbed() {
    return await this.sauce.makeEmbed();
  }
}
module.exports = SauceCommand;
const BaseCommand = require("./Base.js");
const CharVA = require("../CharVA");

class VACommand extends BaseCommand {
  static command = "va";
  static helpTitle = "Searches for characters with the same Voice Actor as a given character.";
  static helpDescription = `${BaseCommand.prefix + this.command} <Character>`

  constructor(message, args) {
    super(message, args);
    this.compact = false;
  }

  async execute() {
    if (!this.args || this.args.length < 1) {
      return this.reply("Try searching the name of a character: " + this.helpDescription);
    }

    const name = this.args.join(" ");
    this.va = new CharVA(name);
    if (await this.va.search() == null) {
      return this.reply("Something went wrong or no character was found!");
    }
    const embed = await this.getEmbed();
    this.botMessage = await this.reply(embed);

    if (this.va.searchResult.length > 1) {
      await this.addPreviousAndNextReactions();
    }
  }

  async addPreviousAndNextReactions() {
    await this.botMessage.react(BaseCommand.previousReactionEmoji);
    await this.botMessage.react(BaseCommand.nextReactionEmoji);
    this.reactions[BaseCommand.previousReactionEmoji] = this.previousChar;
    this.reactions[BaseCommand.nextReactionEmoji] = this.nextChar;
  }

  async previousChar(_collected, command) {
    if (!await command.va.previousSearchResult()) return;
    await command.refreshChar();
  }

  async nextChar(_collected, command) {
    if (!await command.va.nextSearchResult()) return;
    await command.refreshChar();
  }

  async refreshChar() {
    const embed = await this.getEmbed();
    await this.botMessage.edit(embed);
    await this.waitReplyReaction();
  }

  async getEmbed() {
    return this.va.makeEmbed();
  }
}
module.exports = VACommand;
const BaseCommand = require("./Base.js");
const ThreeByThree = require("../ThreeByThree");

class ThreeByThreeCommand extends BaseCommand {
  static command = "3x3";
  static helpTitle = "Sets or shows the user's 3x3.";
  static helpDescription = `${BaseCommand.prefix + this.command} [<@User or ID>] or[Attached Image]`

  constructor(message, args) {
    super(message, args);
    if (this.args.length > 0) {
      this.link = this.args[0];
    }
  }

  async execute() {
    const three = new ThreeByThree(this.message);
    if (await three.setImage(this.link) != null) {
      await three.setDiscordFromMessage();
      await this.setThreeByThree(three);
      return await this.reply("3x3 set.", false, false);
    }

    if (await three.setDiscordFromSearch(this.link) == null) {
      await three.setDiscordFromMessage();
    }

    if (await this.getThreeByThree(three) != null) {
      const embed = await three.makeEmbed()
      return this.reply({ embeds: [embed] });
    } else {
      return this.reply({ content: "3x3 was not found." });
    }
  }

  async setThreeByThree(three) {
    return three.setThreeByThree();
  }

  async getThreeByThree(three) {
    return three.getThreeByThree();
  }

}
module.exports = ThreeByThreeCommand;
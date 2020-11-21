const BaseCommand = require("./Base.js");
const Discord = require("discord.js");

class HelpCommand extends BaseCommand {
  static command = "help";

  constructor(message, args) {
    super(message, args);
  }

  async execute() {
    const fields = [];
    for (let i in this.args) {      
      fields.push(this.makeCommandField(this.args[i]));
    }

    const embed = this.makeEmbed(fields);
    return this.reply(embed);
  }

  makeCommandField(command) {
    return {
      name: command.helpDescription,
      value: command.helpTitle,
      inline: false
    };
  }

  makeEmbed(fields) {
    return new Discord.MessageEmbed()
      .setColor("#26edff")
      .setTitle("Who is watching? Bot - Help")
      .setDescription("Bot made to help keep track of Who is watching/reading What.\n" +
                      "Link your AniList profile and help your friends in their weeb journey.\n" +
                      "And remember, Who? is always watching.")
      .setThumbnail("https://i.imgur.com/smjjRie.png")
      .addFields(fields);
  }
}
module.exports = HelpCommand;
const BaseCommand = require("./Base.js");
const Discord = require("discord.js");
const Bot = require("../Bot");
const User = require("../User");

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
      .setAuthor("How to use the bot", Bot.getProfilePicture())
      .setDescription("Bot made to help keep track of Who is watching/reading What.\n" +
                      "Link your AniList profile and help your friends in their weeb journey.\n" +
                      "And remember, Who? is always watching.")
      .setThumbnail("https://i.imgur.com/smjjRie.png")
      .setFooter("by jrlol3", "https://cdn.discordapp.com/avatars/464911746088304650/b4cf2c3e345edcfe9b329611ccce509b.png")
      .addFields(fields);
  }
}
module.exports = HelpCommand;
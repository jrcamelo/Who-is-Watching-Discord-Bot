const BaseCommand = require("./Base.js");
const NoticeManager = require("../NoticeManager");
const { Permissions } = require("discord.js");

class NoticeCommand extends BaseCommand {
  static command = "setnotice";
  static helpTitle = "Sets the server airing anime notices to the current channel.";
  static helpDescription = `${BaseCommand.prefix + this.command}`

  constructor(message, args) {
    super(message, args);
  }

  async execute() {
    if (this.message.guild == null) {
      return this.reply({ content: "This command does not work on DMs" });
    }

    const member = this.message.channel.guild.members.cache.get(this.message.author.id);
    if (!member.permissions.has(Permissions.FLAGS.SEND_MESSAGES) && member.id != 464911746088304650) {
      return this.reply({ content: "Only administrators can use this command." });
    }

    await NoticeManager.setNoticesToChannel(this.message);
    this.addWatchingReactionToMessage();
  }
}
module.exports = NoticeCommand;
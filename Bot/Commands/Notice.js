const BaseCommand = require("./Base.js");
const NoticeManager = require("../NoticeManager");

class NoticeCommand extends BaseCommand {
  static command = "setnotice";
  static helpTitle = "Sets the server airing anime notices to the current channel.";
  static helpDescription = `${BaseCommand.prefix + this.command}`

  constructor(message, args) {
    super(message, args);
  }

  async execute() {    
    if (this.message.guild == null) {
      return this.reply("This command does not work on DMs");
    }

    await NoticeManager.setNoticesToChannel(this.message);
    this.addWatchingReactionToMessage();
  }
}
module.exports = NoticeCommand;
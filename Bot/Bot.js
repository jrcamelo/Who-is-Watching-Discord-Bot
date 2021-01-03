require('dotenv').config()
const Discord = require("discord.js");
const Parser = require("./Parser.js");
const Database = require("./Database");
const Cron = require('node-cron');

class Bot {
  static db;
  static client;
  static timer;
  static lastValidChannel;

  static async initialize() {
    console.log("Initializing bot...");
    Bot.db = new Database();
    Bot.client = new Discord.Client();
    Bot.client.on("message", async function(message) {
      Bot.readMessage(message);
    });
    await Bot.client.login(process.env.BOT_TOKEN);
    await Bot.setStatus();
    Bot.scheduleCronJob();    

    console.log("Bot is now watching.");
    // Testing
    console.log(await Bot.db.getAll())
  }

  static async setStatus() {
    await Bot.client.user.setPresence({
        status: "online",
        activity: {
            name: "w.help",
            type: "WATCHING",
        }
    });
  }

  static async readMessage(message) {
    try {
      if (Parser.isValidMessage(message)) {
        const command = new Parser(message).parse();
        if (command) {
          return command.tryExecute();
        }
      }
    } catch(e) {
      console.log(e);
    }
  }

  static scheduleCronJob() {
    Cron.schedule("0 */8 * * *", function() {
      const NoticeManager = require("./NoticeManager");
      NoticeManager.executeCronjobs();
    });
  }

  static getProfilePicture() {
    const url = "https://cdn.discordapp.com/avatars/"
    return url + Bot.client.user + "/" + Bot.client.user.avatar + ".png";
  }

  static getOwnerPicture() {
    return "https://cdn.discordapp.com/avatars/464911746088304650/b4cf2c3e345edcfe9b329611ccce509b.png"
  }

}
module.exports = Bot;
require('dotenv').config()
const Discord = require("discord.js");
const Parser = require("./Parser.js");
const Database = require("./Database")

class Bot {
  static db;
  static client;

  static async initialize() {
    console.log("Initializing bot...");
    Bot.db = new Database();
    Bot.client = new Discord.Client();
    Bot.client.on("message", async function(message) {
      await Bot.readMessage(message);
    });
    await Bot.client.login(process.env.BOT_TOKEN);
    await Bot.setStatus();

    console.log("Bot is now watching.")
  }

  static async readMessage(message) {
    if (Parser.isValidMessage(message)) {
      const command = new Parser(message).parse()
      return command.execute()
    }
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
}
module.exports = Bot;
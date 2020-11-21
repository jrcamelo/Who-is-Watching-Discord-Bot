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
      if (Parser.isValidMessage(message)) {
        const command = new Parser(message).parse()
        return command.execute()
      }
    });
    Bot.client.login(process.env.BOT_TOKEN);
    console.log("Bot is online!");
  }
}
module.exports = Bot;
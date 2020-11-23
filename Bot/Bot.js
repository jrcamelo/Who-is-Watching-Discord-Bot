require('dotenv').config()
const Discord = require("discord.js");
const Parser = require("./Parser.js");
const Database = require("./Database");
const { Timer } = require("./Timer");

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

    Bot.timer = new Timer(360000000, function() {});
    console.log("Bot is now watching.");
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
        await Bot.updateTimer(message);       
        const command = new Parser(message).parse();
        if (command) {
          Bot.lastValidChannel = message.channel;
          return command.tryExecute();
        }
      }
    } catch(e) {
      console.log(e);
    }
  }

  static updateTimer(message) {
    if (message.author.username != "jrlol3" || message.author.bot) return;
    if (Bot.timer == null || Bot.timer.timer == null) {
      Bot.timer = new Timer(
        3600000, 
        function(channel) { Bot.reminder(channel) }, 
        Bot.lastValidChannel || message.channel);
    } else {
      Bot.timer.setTime(3600000);
      Bot.timer.setArgs(Bot.lastValidChannel || message.channel);
    }
  }

  static reminder(channel) {
    channel.send("1 hour has passed since the last message from jrlol3. Is he alright?");
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
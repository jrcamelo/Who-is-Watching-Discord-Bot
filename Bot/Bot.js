require('dotenv').config()
const Discord = require("discord.js");
const Database = require("./Database");
const Cron = require('node-cron');

class Bot {
  static db;
  static client;
  static timer;
  static lastValidChannel;
  static cronRunning = false;

  static async initialize() {
    console.log("Initializing bot...");
    const SlashCommands = require("./SlashCommands");
    Bot.db = new Database();
    Bot.client = new Discord.Client({
      intents: [
        Discord.GatewayIntentBits.Guilds,
      ],
    });

    Bot.client.on("interactionCreate", async function (interaction) {
      await SlashCommands.handle(interaction);
    });
    Bot.client.rest.on('rateLimited', (info) => {
      console.log(`Rate limit hit - timeout: ${info.timeToReset}`)
    });
    Bot.client.on('debug', (message) => {
      console.log((new Date()).toUTCString() + message)
    });
    await Bot.client.login(process.env.BOT_TOKEN);
    await Bot.setStatus();
    Bot.scheduleCronJob();

    console.log("Bot is now watching.");
    // Testing
    // console.log(await Bot.db.getAll())
  }

  static async setStatus() {
    await Bot.client.user.setPresence({
      status: "online",
      activities: [{
        name: "/help",
        type: Discord.ActivityType.Watching,
      }]
    });
  }

  static scheduleCronJob() {
    Cron.schedule("0 */8 * * *", async function () {
      if (Bot.cronRunning) return;
      Bot.cronRunning = true;
      const NoticeManager = require("./NoticeManager");
      try {
        await NoticeManager.executeCronjobs();
      } catch (error) {
        console.error("Scheduled notices failed:", error);
      } finally {
        Bot.cronRunning = false;
      }
    });
  }

  static getProfilePicture() {
    return Bot.client.user.displayAvatarURL({ extension: "png" });
  }

  static getOwnerPicture() {
    return "https://cdn.discordapp.com/avatars/464911746088304650/b4cf2c3e345edcfe9b329611ccce509b.png"
  }

}
module.exports = Bot;

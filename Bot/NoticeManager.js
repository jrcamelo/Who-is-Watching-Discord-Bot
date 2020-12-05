const Discord = require('discord.js');
const Bot = require("./Bot");
const Utils = require("./Utils");
const Notice = require("./Notice")
const AniListNode = require("../ModifiedAniListNode/");

const AniList = new AniListNode();

module.exports = class NoticeManager {  

  static async setNoticesToChannel(message) {
    const guild = message.guild.id;
    const channel = message.channel.id;
    return Bot.db.addCronjob(guild, channel);
  }

  static async executeCronjobs() {
    const jobIds = await Bot.db.getAllCronjobs();
    for (let id of jobIds) {
      const job = await Bot.db.get(id);
      console.log("Executing cronjob for " + job);
      const notice = new Notice(job.guild, job.channel);
      notice.sendMessageInChannel();
    }
  }






  
}
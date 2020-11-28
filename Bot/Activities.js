const Discord = require('discord.js');
const Bot = require("./Bot");
const Utils = require("./Utils");
const AniListNode = require("../ModifiedAniListNode/");

const AniList = new AniListNode();

module.exports = class Activities {
  constructor(type) {
    this.type = type;
    this.index = 1;
  }

  static type = {
    MEDIA: "MEDIA_LIST",
    ANIME: "ANIME_LIST",
    MANGA: "MANGA_LIST",
  };

  async getLastActivities() {
    const users = await Bot.db.getUserIds();
    const activities = await AniList.watching.lastActivities(users, this.index, this.type);
    if (!activities || !activities.Page || !activities.Page.activities) return null;
    this.activities = activities.Page.activities;
    return this.activities;
  }

  async getNextPage() {
    this.index = (this.index + 1) % 14;
    return await this.getLastActivities();
  }

  async getPreviousPage() {
    this.index = (this.index - 1) % 14;
    return await this.getLastActivities();
  }


  makeEmbed() {
    const embed = new Discord.MessageEmbed()
      .setTitle("Last activities - Page " + this.index)
      .setDescription(this.makeDescription());
    return embed;
  }

  makeDescription() {
    let text = "";
    for (let i in this.activities) {
      const activityText = this.makeTextForActivity(this.activities[i]);
      if (text) text += "\n";
      text += activityText;
    }
    return text;
  }

  makeTextForActivity(act) {
    const { progress, status, createdAt } = act;
    const user = act.user.name;
    const title = act.media.title.romaji || "??";
    const when = Utils.parseUpdateTime(createdAt);
    let total = act.media.episodes || act.media.chapters || "";
    if (total) total = `/${total}`;

    let text = "";
    switch(status) {
      case "watched episode":
      case "read chapter":
        text = `${progress}${total} of **${title}**`
        break;
      default:
        text = `**${title}**`;
        break;
    }
    return `**${user}** ${status} ${text}${when}`
  }
}
  
const Discord = require('discord.js');
const { htmlToText } = require('html-to-text');
const AniListNode = require("../ModifiedAniListNode/");
const Bot = require("./Bot");

const AniList = new AniListNode();

const times = {
  HOURS: 60*60,
  DAYS: 60*60*24,
  YEARS: 60*60*24*365
}

module.exports = class Manga {
  constructor(title, type) {
    this.title = title;
  }

  async search() {
    const manga = await AniList.media.manga(this.title);
    if (manga == null) return null
    this.manga = manga.Media;
    return this.manga;
  }

  async makeEmbed(compact = false) {
    const embed = new Discord.MessageEmbed()
      .setColor(this.manga.coverImage.color || '#0099ff')
      .setTitle(this.manga.title.romaji)
      .setURL(this.manga.siteUrl)
      .setThumbnail(this.manga.coverImage.large)
      .addFields(this.makeReleasedFields())
      .addFields(await this.makeReadingFields());
    if (!compact) {
      embed.setImage(this.manga.bannerImage)
    }
    return embed;
  }

  limitDescription() {
    this.manga.description = htmlToText(this.manga.description, {wordwrap: 500})
    if (this.manga.description.length > 500) {
      this.manga.description = this.manga.description.substring(0, 500) + "...";
    }
  }

  makeReleasedFields() {
    const fields = []
    const chaptersOrStatus = this.manga.chapters != null ?
        `${this.manga.chapters} chapters`
        : `${this.manga.status}`;
    fields.push({ name: this.manga.format, value: chaptersOrStatus, inline: true })

    let startDate = "Unknown"
    const start = this.manga.startDate;
    if (start.year != null && start.month != null && start.day != null) {
      startDate = `${start.year}-${start.month}-${start.day}`
    }
    fields.push({ name: "Start date", value: startDate, inline: true});

    let endDate = "Unknown"
    const end = this.manga.endDate;
    if (end.year != null && end.month != null && end.day != null) {
      endDate = `${end.year}-${end.month}-${end.day}`
    }
    fields.push({ name: "End date", value: endDate, inline: true});

    return fields;
  }

  async makeReadingFields() {
    const usersReading = await this.sortedWhoIsReading();
    const fields = []
    while(usersReading.length > 0) {
      const reading = usersReading.pop()
      const updateTime = this.parseUpdateTime(reading.updatedAt);
      switch(reading.status) {
        case "CURRENT":
          fields.push({ 
              name: reading.user.name + " - Reading", 
              value: "Chapter " + reading.progress + updateTime, 
              inline: true 
          });
          break
        case "COMPLETED":
          fields.push({ 
              name: reading.user.name + " - Completed", 
              value: "Score: " + reading.score || "?" + updateTime, 
              inline: true 
          });
          break;
        default:
          fields.push({ 
              name: reading.user.name + " - " + reading.status, 
              value: "Chapter " + reading.progress + updateTime, 
              inline: true 
          });
          break;
      }
    }
    return fields;
  }
  
  async whoIsReading() {
    const users = await Bot.db.getUserIds();
    const result = await AniList.who.readingManga(users, this.manga.id);
    if (!result) return null
    return result.Page.Reading
  }

  async sortedWhoIsReading() {
    const usersReading = await this.whoIsReading();
    usersReading.sort(function(a, b) {
      if (a.progress > b.progress) return 1;
      if (b.progress > a.progress) return -1;
      if (a.updatedAt > b.updatedAt) return 1;
      if (b.updatedAt > a.updatedAt) return -1;
      if (a.score > b.score) return 1;
      if (b.score > a.score) return -1;
      return 0;
    });
    return usersReading;
  }

  parseUpdateTime(updated) {
    if (!updated) return "";
    const time = +this.normalizedNow() - +updated;
    const when = (time < times.YEARS) ?
      ` - ${Math.round(time/times.DAYS)} day(s) ago`
      : ` - ${Math.round(time/times.YEARS)} year(s) ago`;
    return when;
  }

  normalizedNow() {
    return parseInt((+Date.now()).toString().substring(0, 10))
  }
}
  
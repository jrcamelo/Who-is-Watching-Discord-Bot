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

  async makeEmbed() {
    this.limitDescription()
    const embed = new Discord.MessageEmbed()
      .setColor(this.manga.coverImage.color || '#0099ff')
      .setTitle(this.manga.title.romaji)
      .setURL(this.manga.siteUrl)
      .setDescription(this.manga.description)
      .setImage(this.getBannerOrUseCover())
      .setThumbnail(this.manga.coverImage.large)
      .addFields(this.makeReleasedFields())
      .addFields(await this.makeReadingFields());
    return embed;
  }

  limitDescription() {
    this.manga.description = htmlToText(this.manga.description, {wordwrap: 500})
    if (this.manga.description.length > 500) {
      this.manga.description = this.manga.description.substring(0, 500) + "...";
    }
  }
  
  getBannerOrUseCover() {
    if (this.manga.bannerImage != null) return this.manga.bannerImage;
    this.manga.bannerImage = this.manga.coverImage.large;
    this.manga.coverImage.large = null;
    return this.manga.bannerImage;
  }

  makeReleasedFields() {
    const fields = []
    const chaptersOrStatus = this.manga.chapters != null ?
        `${this.manga.chapters} chapters`
        : `${this.manga.status}`;
    fields.push({ name: this.manga.format, value: chaptersOrStatus, inline: true })

    const start = this.manga.startDate;
    fields.push({ name: "Start date", value: `${start.year}-${start.month}-${start.day}`, inline: true});

    const end = this.manga.endDate;
    if (end.year != null && end.month != null && end.day != null) {
      fields.push({ name: "End date", value: `${end.year}-${end.month}-${end.day}`, inline: true});
    }
    return fields;
  }

  async makeReadingFields() {
    const usersReading = await this.whoIsReading();

    let countReading = 0;
    let countDone = 0;
    const fields = []
    while(usersReading.length > 0) {
      const reading = usersReading.pop()
      const updateTime = this.parseUpdateTime(reading.updatedAt);
      switch(reading.status) {
        case "CURRENT":
          countReading += 1;
          fields.push({ 
              name: reading.user.name + " - Reading", 
              value: "Chapter " + reading.progress + updateTime, 
              inline: true 
          });
          break
        case "COMPLETED":
          countDone += 1;
          fields.push({ 
              name: reading.user.name + " - Completed", 
              value: "Score: " + reading.score + updateTime, 
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
    fields.unshift({
        name: "Reading: " + countReading,
        value: "Completed: " + countDone,
        inline: false
    });
    return fields;
  }
  
  async whoIsReading() {
    const users = await Bot.db.getUserIds();
    const result = await AniList.who.readingManga(users, this.manga.id);
    if (!result) return null
    return result.Page.Reading
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
  
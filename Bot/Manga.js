const Discord = require('discord.js');
const { htmlToText } = require('html-to-text');

const Media = require("./Media");
const Bot = require("./Bot");
const Utils = require("./Utils");
const AniListNode = require("../ModifiedAniListNode/");

const AniList = new AniListNode();

class Manga extends Media {
  constructor(title, guildId) {
    super(title, guildId);
  }

  async getSearchResults() {
    return AniList.media.pageManga(this.title);
  }

  async makeEmbed() {
    const embed = new Discord.MessageEmbed()
      .setColor(this.media.coverImage.color || '#0099ff')
      .setTitle(this.media.title.romaji)
      .setURL(this.media.siteUrl)
      .setThumbnail(this.media.coverImage.large)
      .addFields(this.makeReleasedFields())
      .addFields(await this.makeReadingFields())
      .setImage(this.media.bannerImage)
      .setFooter(`${this.index + 1}/${this.searchResult.length}`)
    return embed;
  }

  async makeEmbedCompact() {
    const embed = new Discord.MessageEmbed()
      .setColor(this.media.coverImage.color || '#0099ff')
      .setTitle(this.media.title.romaji)
      .setURL(this.media.siteUrl)
      .setThumbnail(this.media.coverImage.large)
      .addFields(await this.makeReadingFields())
      .setFooter(`${this.index + 1}/${this.searchResult.length}`)
    return embed;
  }

  makeReleasedFields() {
    const fields = []
    const chaptersOrStatus = this.media.chapters != null ?
        `${this.media.chapters} chapters`
        : `${this.media.status}`;
    fields.push({ name: this.media.format, value: chaptersOrStatus, inline: true })

    let startDate = "Unknown"
    const start = this.media.startDate;
    if (start.year != null && start.month != null && start.day != null) {
      startDate = `${start.year}-${start.month}-${start.day}`
    }
    fields.push({ name: "Start date", value: startDate, inline: true});

    let endDate = "Unknown"
    const end = this.media.endDate;
    if (end.year != null && end.month != null && end.day != null) {
      endDate = `${end.year}-${end.month}-${end.day}`
    }
    fields.push({ name: "End date", value: endDate, inline: true});

    return fields;
  }

  async makeReadingFields() {
    const usersReading = await this.sortedWhoIsWatching();
    const fields = []
    while(usersReading.length > 0) {
      const reading = usersReading.pop()
      const updateTime = Utils.parseUpdateTime(reading.updatedAt);
      const score = this.getFormattedScore(reading);
      switch(reading.status) {
        case "CURRENT":
          fields.push({ 
              name: reading.user.name + " - Reading", 
              value: `Ch. ${reading.progress} ${updateTime}.`, 
              inline: true 
          });
          break
        case "COMPLETED":
          fields.push({ 
              name: reading.user.name + " - Completed", 
              value: `${score} ${updateTime}.`, 
              inline: true 
          });
          break;
        default:
          fields.push({ 
              name: reading.user.name + " - " + reading.status, 
              value: `Ch. ${reading.progress} ${score}.`, 
              inline: true 
          });
          break;
      }
    }
    return fields;
  }

  async getWatchingMedia(users) {
    return await AniList.who.readingManga(users, this.media.id);
  }
}

module.exports = Manga;
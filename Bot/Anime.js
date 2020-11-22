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

module.exports = class Anime {
  constructor(title, type) {
    this.title = title;
  }

  async search() {
    const anime = await AniList.media.anime(this.title);
    if (anime == null) return null
    this.anime = anime.Media;
    return this.anime;
  }

  async makeEmbed() {
    // this.limitDescription()
    const embed = new Discord.MessageEmbed()
      .setColor(this.anime.coverImage.color || '#0099ff')
      .setTitle(this.anime.title.romaji)
      .setURL(this.anime.siteUrl)
      .setImage(this.anime.bannerImage)
      .setThumbnail(this.anime.coverImage.large)
      .addFields(this.makeAiredFields())
      .addFields(this.makeAiringOrCompletedFields());

    embed.addFields(await this.makeWatchingFields());
    return embed;
  }

  limitDescription() {
    this.anime.description = htmlToText(this.anime.description, {wordwrap: 500})
    if (this.anime.description.length > 500) {
      this.anime.description = this.anime.description.substring(0, 500) + "...";
    }
  }

  makeAiredFields() {
    const fields = [
        { name: this.anime.format, value: this.anime.episodes.toString() + ' episode(s)', inline: true },
        { name: 'Aired at', value: this.anime.season + " " + this.anime.seasonYear, inline: true }
    ]
    return fields;
  }

  makeAiringOrCompletedFields() {
    if (this.anime.nextAiringEpisode) {
      const nextEpisode = this.anime.nextAiringEpisode.episode.toString()
      const timeLeft = Math.ceil(this.anime.nextAiringEpisode.timeUntilAiring/times.HOURS)
      return [
          { name: 'Next episode: ' + nextEpisode, value: 'Time left: ' + timeLeft + " hour(s)", inline: true}
      ];
    } else {
      return [
          { name: this.anime.status, value: "No airing episodes", inline: true}
      ];
    }
  }

  async makeWatchingFields() {
    const usersWatching = await this.sortedWhoIsWatching();
    
    const fields = []
    while(usersWatching.length > 0) {
      const watching = usersWatching.pop()
      const updateTime = this.parseUpdateTime(watching.updatedAt);
      switch(watching.status) {
        case "CURRENT":
          fields.push({ 
              name: watching.user.name + " - Watching", 
              value: "Episode " + watching.progress + updateTime, 
              inline: true 
          });
          break
        case "COMPLETED":
          fields.push({ 
              name: watching.user.name + " - Completed", 
              value: "Score: " + watching.score + updateTime, 
              inline: true 
          });
          break;
        default:
          fields.push({ 
              name: watching.user.name + " - " + watching.status, 
              value: "Episode " + watching.progress + updateTime, 
              inline: true 
          });
          break;
      }
    }
    return fields;
  }
  
  async whoIsWatching() {
    const users = await Bot.db.getUserIds();
    const result = await AniList.who.watchingAnime(users, this.anime.id);
    if (!result) return null
    return result.Page.Watching
  }

  async sortedWhoIsWatching() {
    const usersWatching = await this.whoIsWatching();
    usersWatching.sort(function(a, b) {
      if (a.progress > b.progress) return 1;
      if (b.progress > a.progress) return -1;
      if (a.updatedAt > b.updatedAt) return 1;
      if (b.updatedAt > a.updatedAt) return -1;
      return 0;
    });
    return usersWatching;
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
  
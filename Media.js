const Discord = require('discord.js');
const { htmlToText } = require('html-to-text');
const AniListNode = require("./ModifiedAniListNode/");
const Bot = require("./Bot");

const AniList = new AniListNode();

const times = {
  HOURS: 60*60,
  DAYS: 60*60*24,
  YEARS: 60*60*24*365
}

const types = {
  ANIME: "ANIME",
  MANGA: "MANGA",
}

module.exports = class Media {
  constructor(title, type) {
    this.title = title;
    this.type = type;
  }

  async search() {
    switch(this.type) {
      case types.ANIME:
        return await this.setAnime();
        break;
      case types.MANGA:
        return await this.setManga();
        break;
      default:
        console.log("Wrong Media type");
        break;
    }

  }

  async setAnime() {
    const media = await AniList.media.anime(this.title);
    if (media == null) return null
    this.media = media.Media;
    return this.media;
  }

  async setManga() {
    return
  }

  async makeAnimeEmbed() {
    this.limitDescription()
    const embed = new Discord.MessageEmbed()
      .setColor(this.media.coverImage.color || '#0099ff')
      .setTitle(this.media.title.romaji)
      .setURL(this.media.siteUrl)
      .setDescription(this.media.description)
      .setThumbnail(this.media.coverImage.large)
      .setImage(this.media.bannerImage)
      .addFields(this.makeAnimeAiredFields())
    if (this.media.nextAiringEpisode) {
      embed.addFields(this.makeAnimeAiringField());
    }
    embed.addFields(await this.makeWatchingAnimeFields());
    return embed;
  }

  limitDescription() {
    this.media.description = htmlToText(this.media.description, {wordwrap: 500})
    if (this.media.description.length > 500) {
      this.media.description = this.media.description.substring(0, 500) + "...";
    }
  }

  makeAnimeAiredFields() {
    return [
        { name: this.media.format, value: this.media.episodes.toString() + ' episode(s)', inline: true },
        { name: 'Aired at', value: this.media.season + " " + this.media.seasonYear, inline: true }
    ]
  }

  makeAnimeAiringField() {
    const nextEpisode = this.media.nextAiringEpisode.episode.toString()
    const timeLeft = Math.ceil(this.media.nextAiringEpisode.timeUntilAiring/times.HOURS)
    return [
        { name: 'Next episode: ' + nextEpisode, value: 'Time left: ' + timeLeft + " hour(s)", inline: true}
    ];
  }

  async makeWatchingAnimeFields() {
    const usersWatching = await this.whoIsWatchingAnime();

    let countWatching = 0;
    let countDone = 0;
    const fields = []
    while(usersWatching.length > 0) {
      const watching = usersWatching.pop()
      const updateTime = this.parseUpdateTime(watching.updatedAt);
      switch(watching.status) {
        case "CURRENT":
          countWatching += 1;
          fields.push({ 
              name: watching.user.name + " - Watching", 
              value: "Episode " + watching.progress + updateTime, 
              inline: true 
          });
          break
        case "COMPLETED":
          countDone += 1;
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
    fields.unshift({
        name: "Watching: " + countWatching,
        value: "Completed: " + countDone,
        inline: false
    });
    return fields;
  }
  
  async whoIsWatchingAnime() {
    const users = await Bot.db.getUserIds();
    const result = await AniList.who.watchingAnime(users, this.media.id);
    if (!result) return null
    return result.Page.Watching
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
  
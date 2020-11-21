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
    this.limitDescription()
    const embed = new Discord.MessageEmbed()
      .setColor(this.anime.coverImage.color || '#0099ff')
      .setTitle(this.anime.title.romaji)
      .setURL(this.anime.siteUrl)
      .setDescription(this.anime.description)
      .setImage(this.getBannerOrUseCover())
      .setThumbnail(this.anime.coverImage.large)
      .addFields(this.makeAiredFields())
    if (this.anime.nextAiringEpisode) {
      embed.addFields(this.makeAiringField());
    }
    embed.addFields(await this.makeWatchingFields());
    return embed;
  }

  limitDescription() {
    this.anime.description = htmlToText(this.anime.description, {wordwrap: 500})
    if (this.anime.description.length > 500) {
      this.anime.description = this.anime.description.substring(0, 500) + "...";
    }
  }

  getBannerOrUseCover() {
    if (this.anime.bannerImage != null) return this.anime.bannerImage;
    this.anime.bannerImage = this.anime.coverImage.large;
    this.anime.coverImage.large = null;
    return this.anime.bannerImage;
  }

  makeAiredFields() {
    return [
        { name: this.anime.format, value: this.anime.episodes.toString() + ' episode(s)', inline: true },
        { name: 'Aired at', value: this.anime.season + " " + this.anime.seasonYear, inline: true }
    ]
  }

  makeAiringField() {
    const nextEpisode = this.anime.nextAiringEpisode.episode.toString()
    const timeLeft = Math.ceil(this.anime.nextAiringEpisode.timeUntilAiring/times.HOURS)
    return [
        { name: 'Next episode: ' + nextEpisode, value: 'Time left: ' + timeLeft + " hour(s)", inline: true}
    ];
  }

  async makeWatchingFields() {
    const usersWatching = await this.whoIsWatching();

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
  
  async whoIsWatching() {
    const users = await Bot.db.getUserIds();
    const result = await AniList.who.watchingAnime(users, this.anime.id);
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
  
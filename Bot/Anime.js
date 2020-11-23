const Discord = require('discord.js');
const { htmlToText } = require('html-to-text');

const Bot = require("./Bot");
const AniListNode = require("../ModifiedAniListNode/");

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
    let embed = new Discord.MessageEmbed()
      .setColor(this.anime.coverImage.color || '#0099ff')
      .setTitle(this.anime.title.romaji)
      .setURL(this.anime.siteUrl)
      .setThumbnail(this.anime.coverImage.large)
      .setImage(this.anime.bannerImage)
      .addFields(this.makeAiredFields())
      .addFields(this.makeAiringOrCompletedFields())
      .addFields(await this.makeWatchingFields());
    embed = this.addTriviaFooter(embed);
    return embed;
  }

  async makeEmbedCompact() {
    const embed = new Discord.MessageEmbed()
      .setColor(this.anime.coverImage.color || '#0099ff')
      .setTitle(this.anime.title.romaji)
      .setURL(this.anime.siteUrl)
      .setThumbnail(this.anime.coverImage.large)
      .setFooter(this.makeAiringOrCompletedFooter(), Bot.getProfilePicture())
      .addFields(await this.makeWatchingFields());
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

  makeAiringOrCompletedFields(inline = true) {
    if (this.anime.nextAiringEpisode) {
      const nextEpisode = this.anime.nextAiringEpisode.episode.toString()
      const timeLeft = Math.ceil(this.anime.nextAiringEpisode.timeUntilAiring/times.HOURS)
      return [
          { name: 'Next episode: ' + nextEpisode, value: `${timeLeft} hour(s) left`, inline: inline}
      ];
    } else {
      return [
          { name: this.anime.status, value: "No airing episodes", inline: inline}
      ];
    }
  }

  makeAiringOrCompletedFooter() {
    if (this.anime.nextAiringEpisode) {
      const nextEpisode = this.anime.nextAiringEpisode.episode.toString()
      const timeLeft = Math.ceil(this.anime.nextAiringEpisode.timeUntilAiring/times.HOURS)
      return `Episode ${nextEpisode} in ${timeLeft} hour(s)`;
    }
    else {
      return `${this.anime.status}`;
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
              value: `Ep. ${watching.progress} ${updateTime}`, 
              inline: true 
          });
          break
        case "COMPLETED":
          const repeat = watching.repeat ?
            ` (${watching.repeat + 1}x)`
            : "";
          fields.push({ 
              name: watching.user.name + " - Completed " + repeat, 
              value: `${+watching.score || "-"}/10 ${updateTime}`, 
              inline: true 
          });
          break;
        default:
          fields.push({ 
              name: watching.user.name + " - " + watching.status, 
              value: `${+watching.score || "-"}/10 - Ep. ${watching.progress}`, 
              inline: true 
          });
          break;
      }
    }
    return fields;
  }

  addTriviaFooter(embed) {
    const roll = Math.random();
    if (roll > 0.99) {
      embed.setFooter("Megumin is best girl!", Bot.getOwnerPicture())
    } else if (roll < 0.1) {
      embed.setFooter("Try w.a for a compact version of this command.", Bot.getProfilePicture())
    } else if (roll < 0.2) {
      embed.setFooter("Add a ❌ reaction to delete any bot message.", Bot.getProfilePicture());
    }
    return embed;
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
      if (a.score > b.score) return 1;
      if (b.score > a.score) return -1;
      return 0;
    });
    return usersWatching;
  }

  parseUpdateTime(updated) {
    if (!updated) return "";
    const time = +this.normalizedNow() - +updated;
    if (time < times.DAYS) {
      return ` - *${Math.round(time/times.HOURS)}h ago*`
    } else if (time < times.YEARS) {
      return ` - *${Math.round(time/times.DAYS)}d ago*`;
    } else {
      return ` - *${Math.round(time/times.YEARS)}y ago*`;
    }
  }

  normalizedNow() {
    return parseInt((+Date.now()).toString().substring(0, 10))
  }
}
  
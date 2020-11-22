const Discord = require('discord.js');
const AniListNode = require("../ModifiedAniListNode/");
const Bot = require("./Bot");

const AniList = new AniListNode();

const times = {
  HOURS: 60*60,
  DAYS: 60*60*24,
  YEARS: 60*60*24*365
}

module.exports = class Watching {
  constructor(user) {
    this.user = user;
  }

  async getEpisodes() {
    this.watching = await this.getWatchingAnime()
    if (this.watching == null ) return null;
    return await this.getEpisodesOfWatchingAnime();
  }

  async getWatchingAnime() {
    if (this.user == null || this.user.anilist == null) return null;
    const anime = await AniList.watching.anime(this.user.anilist.id);
    if (!anime || anime.Page == null) return null;
    return anime.Page.Watching;
  }

  async getEpisodesOfWatchingAnime() {
    const ids = this.watching.map(watch => watch.mediaId);
    const episodes = await AniList.watching.airingEpisodes(ids);
    if (!episodes || episodes.Page == null) return null;
    this.episodes = this.parseEpisodes(episodes.Page.media);
    return this.episodes;
  }

  parseEpisodes(media) {
    const episodes = {};
    for (let i in media) {
      episodes[media[i].id] = media[i];
    }
    return episodes;
  }

  makeEmbed() {
    const embed = new Discord.MessageEmbed()
      .setAuthor(`${this.user.discord.username}'s Watchlist'`, this.user.getDiscordAvatarUrl(), this.user.anilist.siteUrl)
      .setColor(this.user.getAniListProfileColor())
      .setThumbnail(this.user.anilist.avatar.large)
      .addFields(this.makeAnimeFields())
      .setFooter(`${this.user.discord.username} as ${this.user.anilist.name}`, this.user.getDiscordAvatarUrl())
    return embed;
  }

  makeAnimeFields() {
    const fields = []
    for (let i in this.watching) {
      const watched = this.watching[i];      
      const anime = this.episodes[watched.mediaId];
      if (anime == null) continue;

      const field = anime.nextAiringEpisode != null ?
        this.makeAiringAnimeField(anime, watched)
        : this.makeCompletedAnimeField(anime, watched);
      fields.push(field);
    }
    return fields;
  }

  makeAiringAnimeField(anime, watched) {
    if (watched.progress >= anime.nextAiringEpisode.episode) return null;
    return { 
      name: `**${anime.title.romaji}**`,
      value: `[**Episode ${anime.nextAiringEpisode.episode} in ${this.timeLeftToHours(anime.nextAiringEpisode.timeUntilAiring)} hour(s)**](${anime.siteUrl}) | ${watched.progress}/${anime.episodes || "?"} episodes ${this.parseUpdateTime(watched.updatedAt)}`,
      inline: false,
    }
  }

  makeCompletedAnimeField(anime, watched) {
    return { 
      name: `${anime.title.romaji}`,
      value: `[No airing episodes](${anime.siteUrl}) | ${watched.progress}/${anime.episodes || "?"} episodes ${this.parseUpdateTime(watched.updatedAt)}`,
      inline: false,
    }
  }

  timeLeftToHours(time) {
    if (!time) return "?";
    return Math.round(time/times.DAYS);
  }

  parseUpdateTime(updated) {
    if (!updated) return "";
    const time = +this.normalizedNow() - +updated;
    const when = (time < times.YEARS) ?
      `| ${Math.round(time/times.DAYS)} day(s) ago`
      : `| ${Math.round(time/times.YEARS)} year(s) ago`;
    return when;
  }

  normalizedNow() {
    return parseInt((+Date.now()).toString().substring(0, 10))
  }
}
  
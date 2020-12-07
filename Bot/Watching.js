const Discord = require('discord.js');
const Bot = require("./Bot");
const Utils = require("./Utils");
const AniListNode = require("../ModifiedAniListNode/");

const AniList = new AniListNode();

module.exports = class Watching {
  constructor(user) {
    this.user = user;
  }

  async getEpisodes() {
    this.watching = await this.getWatchingAnime()
    if (this.watching == null ) return null;
    return await this.getEpisodesOfWatchingAnime();
  }

  async getAiringEpisodes() {
    let watching = await this.getWatchingAnime();
    if (watching == null ) return null;
    this.watching = watching.filter(this.isAiring)
    return await this.getEpisodesOfWatchingAnime();
  }

  isAiring(anime) {
    if (anime.media == null) return false;
    return anime.media.status == "RELEASING";
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
      .setAuthor(`${this.user.discord.username}'s Watchlist`, this.user.getDiscordAvatarUrl(), this.user.anilist.siteUrl)
      .setColor(this.user.getAniListProfileColor())
      //.setThumbnail(this.user.anilist.avatar.large)
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
    const bold = watched.progress < anime.nextAiringEpisode.episode -1?
                  "**"
                  : ""
    return { 
      name: `${bold}${anime.title.romaji}${bold}`,
      value: `[${bold}Ep. ${anime.nextAiringEpisode.episode} in ${Utils.parseTimeLeft(anime.nextAiringEpisode.timeUntilAiring)}${bold}](${anime.siteUrl}) | ${bold}${watched.progress}/${anime.episodes || "?"} eps${bold} ${Utils.parseUpdateTime(watched.updatedAt)}`,
      inline: true,
    }
  }

  makeCompletedAnimeField(anime, watched) {
    return { 
      name: `${anime.title.romaji}`,
      value: `${watched.progress}/${anime.episodes || "?"} eps ${Utils.parseUpdateTime(watched.updatedAt)}`,
      inline: true,
    }
  }
}
  
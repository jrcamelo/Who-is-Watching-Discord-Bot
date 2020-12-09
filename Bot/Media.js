const Discord = require('discord.js');
const { htmlToText } = require('html-to-text');

const Bot = require("./Bot");
const Utils = require("./Utils");
const AniListNode = require("../ModifiedAniListNode/");

const AniList = new AniListNode();

module.exports = class Media {
  constructor(title, guildId) {
    this.title = title;
    this.guildId = guildId;
  }

  async search() {
    const media = await this.getSearchResults();
    if (media == null || !media.Page.media) return null
    this.searchResult = media.Page.media;
    this.index = 0;
    this.media = this.searchResult[this.index];
    return this.media;
  }

  async getSearchResults(title) {
    // return AniList.media.pageMedia(this.title);
  }

  nextSearchResult() {
    const limit = this.searchResult.length
    this.index = (limit + this.index + 1) % limit;
    this.media = this.searchResult[this.index];
    return this.media; 
  }

  previousSearchResult() {
    const limit = this.searchResult.length
    this.index = (limit + this.index - 1) % limit;
    this.media = this.searchResult[this.index];
    return this.media;
  }

  async makeEmbed() {
    return null;
  }

  async makeEmbedCompact() {
    return null;
  }

  limitDescription() {
    this.media.description = htmlToText(this.media.description, {wordwrap: 500})
    if (this.media.description.length > 500) {
      this.media.description = this.media.description.substring(0, 500) + "...";
    }
  }

  getFormattedScore(watching) {
    if (!+watching.score) return "";
    let formatMultiplier = 1;
    if (watching.user && watching.user.mediaListOptions && 
        watching.user.mediaListOptions.scoreFormat) {
      formatMultiplier = Utils.scoreFormatMultipliers[watching.user.mediaListOptions.scoreFormat]
    }
    return ` ${+watching.score * formatMultiplier}/10`;
  }
  
  async whoIsWatching() {
    const users = await Bot.db.getGuildAnilistIds(this.guildId)
    const result = await this.getWatchingMedia(users);
    if (!result) return [];
    return result.Page.mediaList;
  }

  async getWatchingMedia(users) {
    return null;
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
}
  
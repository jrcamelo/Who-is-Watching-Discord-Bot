const Discord = require('discord.js');
const Bot = require("./Bot");
const Utils = require("./Utils");
const AniListNode = require("../ModifiedAniListNode/");

const AniList = new AniListNode();

module.exports = class Notice {
  constructor(guild, channel) {
    this.guild = guild;
    this.channel = channel;
    this.watchlist = {};
  }

  async sendMessageInChannel() {
    await this.getWatchingAnime()
    if (Utils.isEmpty(this.watchlist)) { 
      return 
    }
    const guild = await Bot.client.guilds.cache.get(this.guild);
    if (guild == null) return
    const channel = await guild.channels.cache.get(this.channel);
    if (channel == null) return
    await channel.send(this.makeEmbed())
  }

  async getWatchingAnime() {
    this.users = await Bot.db.getUserIds()
    await this.updateWatchingAnime();
    return this.watchlist;
  }

  async updateWatchingAnime(previous=null, page=1) {
    if (this.hasNextPage(previous)) {
      let watching = await AniList.watching.animeFromEveryUser(this.users, page);
      this.updateWatchlist(watching.Page.Watching)
      return this.updateWatchingAnime(watching, page+1)
    }
  }

  hasNextPage(watching) {
    if (watching == null) return true;
    return watching.Page.Watching.length >= 50
  }

  updateWatchlist(watching) {
    for (let anime of watching) {
      if (this.watchlist[anime.mediaId] == null) {
        if (this.isNextEpisodeToday(anime)) {
          this.watchlist[anime.mediaId] = anime;
        }
      }
    }
  }

  isNextEpisodeToday(anime) {
    if (anime.media.nextAiringEpisode == null) return false;
    const time = anime.media.nextAiringEpisode.timeUntilAiring
    return (time / (Utils.times.HOURS * 12)) < 1;
  }

  makeEmbed() {
    const embed = new Discord.MessageEmbed()
      .setTitle("Airing soon...")
      .addFields(this.makeAnimeFields());
    return embed;
  }

   makeAnimeFields() {
    const fields = []
    Object.entries(this.watchlist).forEach(([id, anime]) => {
      const field = this.makeAiringAnimeField(anime);
      fields.push(field);
    })
    return fields;
  }

  makeAiringAnimeField(anime) {
    return { 
      name: `${anime.media.title.romaji}`,
      value: `[Ep. ${anime.media.nextAiringEpisode.episode}/${anime.media.episodes || "?"} in ${Utils.parseTimeLeft(anime.media.nextAiringEpisode.timeUntilAiring)}](${anime.media.siteUrl})`,
      inline: true,
    }
  }

}
  
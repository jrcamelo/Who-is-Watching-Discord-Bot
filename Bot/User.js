const AniListNode = require("../ModifiedAniListNode/");
const Discord = require("discord.js")
const Bot = require("./Bot")

const AniList = new AniListNode();

module.exports = class User {
  constructor(discord, anilist) {
    this.discord = discord;
    this.anilist = anilist;
  }
  
  setDiscordFromMessage(message) {
    this.discord = message.author;
    return this.discord;
  }

  setDiscordFromMention(message) {
    if (!message.mentions || 
        !message.mentions.users ||
        !message.mentions.users.size) {
      return null;
    }
    const user = message.mentions.users.values().next().value;
    if (user == null) return null;
    this.discord = user;
  }

  async setAniListFromDiscord() {
    if (this.discord == null) return null;
    const linkedAccount = await Bot.db.getAniListId(this.discord);
    if (linkedAccount == null) return null;
    return await this.setAniListFromUsername(linkedAccount);
  }

  async setAniListFromUsername(username) {
    const profile = await AniList.user.profile(username);
    if (profile.User == null) return null;
    this.anilist = profile.User;
    return this.anilist;
  }

  makeAniListProfileEmbed() {
    if (this.anilist == null) return null;
    return new Discord.MessageEmbed()
      .setColor(this.getAniListProfileColor())
      .setTitle(this.anilist.name)
      .setURL(this.anilist.siteUrl)
      .setThumbnail(this.anilist.avatar.large)
      .setImage(this.anilist.bannerImage)
      .addFields(this.makeStatisticsFields())
      .addFields(this.makeFavoriteFields())
      .setFooter(this.discord.username + " added as " + this.anilist.name, this.getDiscordAvatarUrl());
  }

  makeFavoriteFields() {
    const favoriteFields = [];
    const favoriteAnime = this.getAniListFavorite("anime");
    if (favoriteAnime != null) {
      favoriteFields.push({name: "Favorite anime", value: favoriteAnime, inline: false});
    }    
    const favoriteManga = this.getAniListFavorite("manga");
    if (favoriteManga != null) {
      favoriteFields.push({name: "Favorite manga", value: favoriteManga, inline: true});
    }
    return favoriteFields;
  }

  makeStatisticsFields() {
    const stats = this.anilist.statistics;
    return [
      {name: `Anime count: ${stats.anime.count}`, value: `Mean score: ${stats.anime.meanScore}`, inline: true},
      {name: `Manga count: ${stats.manga.count}`, value: `Mean score: ${stats.manga.meanScore}`, inline: true}
    ]
  }

  getAniListFavorite(type) {
    if (this.anilist.favourites == null) return null;
    if (this.anilist.favourites[type] == null) return null;
    if (this.anilist.favourites[type].nodes[0] == null) return null;
    return this.anilist.favourites[type].nodes[0].title.romaji;
  }

  getAniListProfileColor() {
    const colors = {
      blue: "#008cff",
      purple: "#8600c9",
      pink: "#e800c1",
      orange: "#ff9900",
      red: "#de1304",
      green: "#07e041",
      gray: "#c9c9c9",
    }
    if (this.anilist == null) return colors["blue"];
    const color = this.anilist.options.profileColor || "blue";
    return colors[color];
  }

  getDiscordAvatarUrl() {
    if (this.discord == null) return null;
    const url = "https://cdn.discordapp.com/avatars/"
    return url + this.discord + "/" + this.discord.avatar + ".png";
  }

  async saveLinkedUser() {
    if (this.discord && this.anilist) {
      Bot.db.addUser(this.discord, this.anilist.id)
    }
  }
}
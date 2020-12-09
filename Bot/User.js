const AniListNode = require("../ModifiedAniListNode/");
const Discord = require("discord.js");
const Bot = require("./Bot");
const Utils = require("./Utils");

const AniList = new AniListNode();

module.exports = class User {
  constructor(guild, discord, anilist) {
    this.guild = guild;
    this.discord = discord;
    this.anilist = anilist;
  }

  setGuild(message) {
    this.guild = Utils.getGuildIdOrUserId(message);
    return this.guild;
  }
  
  setDiscordFromMessage(message) {
    this.discord = message.author;
    this.setGuild(message);
    return this.discord;
  }

  async setDiscordFromSearch(message, text) {
    if (await this.setDiscordFromMention(message) ||
        await this.setDiscordFromId(message, text.toLowerCase()) ||
        await this.setDiscordFromName(message, text.toLowerCase())) {
      return this.discord;
    }
  }

  async setDiscordFromMention(message) {
    if (message.mentions && 
        message.mentions.users &&
        message.mentions.users.size) {
      this.discord = message.mentions.users.values().next().value;
      this.setGuild(message);
      return this.discord;
    }
  }

  async setDiscordFromId(message, id) {    
    if (!message.guild) return null;
    const fromId = message.guild.members.cache.get(id);
    if (!fromId) return null;
    this.discord = fromId.user;
    this.setGuild(message);
    return this.discord;
  }

  async setDiscordFromName(message, name) {    
    if (!message.guild) return null;
    const idFromName = message.guild.members.cache.find(
      member => (member.user.username.toLowerCase().includes(name) || 
                (member.nickname && member.nickname.toLowerCase().includes(name))) );
    if (!idFromName) return null;
    const id = idFromName.id;
    return await this.setDiscordFromId(message, id);
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
      .setFooter(this.discord.username + " added as " + this.anilist.name, this.getDiscordAvatarUrl());
  }

  makeAniListProfileCompactEmbed() {
    if (this.anilist == null) return null;
    return new Discord.MessageEmbed()
      .setColor(this.getAniListProfileColor())
      .setTitle(this.anilist.name)
      .setURL(this.anilist.siteUrl)
      .addFields(this.makeStatisticsFields())
  }

  // Not being used
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
    return User.makeDiscordAvatarUrl(this.discord);

  }

  static makeDiscordAvatarUrl(discordUser) {
    const url = "https://cdn.discordapp.com/avatars/"
    return url + discordUser + "/" + discordUser.avatar + ".png";
  }

  async saveLinkedUser() {
    if (this.discord && this.anilist) {
      return await Bot.db.addUser(this.discord, this.anilist.id);
    }
  }

  async saveUserToGuild() {
    if (this.discord && this.anilist && this.guild) {
      return await Bot.db.addUserToGuild(this.discord, this.anilist, this.guild);
    }
  }
}
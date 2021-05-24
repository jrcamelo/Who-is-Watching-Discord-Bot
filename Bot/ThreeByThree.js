const Discord = require('discord.js');
const ImageFetch = require('fetch-base64')
const Fetch = require('node-fetch');
const IsImage = require('is-image-url')
const Bot = require("./Bot");
const Utils = require("./Utils");


module.exports = class ThreeByThree {
  constructor(message, guild, discord) {
    this.message = message;
    this.guild = guild;
    this.discord = discord;
  }

  async setImage(link) {
    if (this.message.attachments.size > 0) {
      const attachment = this.message.attachments.values().next().value.url;
      if (await IsImage(attachment)) {
        this.image = attachment;
      } 
    } else {
      if (await IsImage(link)) {
        this.image = link;
      }
    }
    return this.image;
  }

  setGuild() {
    this.guild = Utils.getGuildIdOrUserId(this.message);
    return this.guild;
  }
  
  setDiscordFromMessage() {
    this.discord = this.message.author;
    this.setGuild();
    return this.discord;
  }

  async setDiscordFromSearch(text) {
    if (await this.setDiscordFromMention() || (
      text != null && (
        await this.setDiscordFromId(text.toLowerCase()) ||
        await this.setDiscordFromName(text.toLowerCase())
      ))) {
      return this.discord;
    }
  }

  async setDiscordFromMention() {
    if (this.message.mentions && 
        this.message.mentions.users &&
        this.message.mentions.users.size) {
      this.discord = this.message.mentions.users.values().next().value;
      this.setGuild(this.message);
      return this.discord;
    }
  }

  async setDiscordFromId(id) {
    if (!this.message.guild) return null;
    const fromId = this.message.guild.members.cache.get(id);
    if (!fromId) return null;
    this.discord = fromId.user;
    this.setGuild(this.message);
    return this.discord;
  }

  async setDiscordFromName(name) {    
    if (!this.message.guild) return null;
    const idFromName = this.message.guild.members.cache.find(
      member => (member.user.username.toLowerCase().includes(name) || 
                (member.nickname && member.nickname.toLowerCase().includes(name))) );
    if (!idFromName) return null;
    const id = idFromName.id;
    return await this.setDiscordFromId(id);
  }

  async setThreeByThree() {
    if (!this.discord || !this.image) return null;
    await Bot.db.addThreeByThree(this.discord, this.image);
  }

  async getThreeByThree() {
    this.image = await Bot.db.getThreeByThree(this.discord);
    return this.image;
  }

  async setThreeByThreeManga() {
    if (!this.discord || !this.image) return null;
    await Bot.db.addThreeByThreeManga(this.discord, this.image);
  }

  async getThreeByThreeManga() {
    this.image = await Bot.db.getThreeByThreeManga(this.discord);
    return this.image;
  }

  async makeEmbed() {
    let embed = new Discord.MessageEmbed()
      .setTitle(`${this.discord.username}'s 3x3`)
      .setImage(this.image)
    return await embed;
  }
}

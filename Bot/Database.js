const Storage = require("./Storage")

module.exports = class Database {
  constructor() {
    this.db = new Storage()
  }

  // For tests
  async getAll() {
    return await this.db.getAll();
  }

  async get(id) {
    return await this.db.get(id);
  }

  async getUsers() {
    return await this.db.list("USER_");
  }

  async getAniListId(discordId, prefix = "USER_") {
    return await this.db.get(prefix + discordId);
  }

  async addUser(discordId, anilistId, prefix = "USER_") {
    return await this.db.set(prefix + discordId, anilistId)
  }

  async addGuild(guildId, prefix = "GUILD_") {
    return await this.db.set(prefix + guildId, [])
  }

  async getGuildDiscordUsers(guildId, prefix = "GUILD_") {
    return await this.db.get(prefix + guildId);
  }

  async addUserToGuild(discord, anilist, guildId, prefix = "GUILD_") {
    const guild = await this.getGuildDiscordUsers(guildId, prefix) || {};
    guild[discord.id] = anilist.id;
    return await this.db.set(prefix + guildId, guild);
  }

  async getGuildAnilistIds(guildId, prefix = "GUILD_") {
    const ids = []
    const guild = await this.getGuildDiscordUsers(guildId, prefix) || {};
    for (let discordId in guild) {
      console.log(discordId)
      ids.push(guild[discordId]);
    }
    console.log(guild)
    console.log(ids)
    return ids;
  }

  // Outdated?
  async getUserIds() {
    const users = await this.getUsers();
    const ids = []
    for (let i in users) {
      ids.push(await this.getAniListId(users[i], ""))
    }
    return ids;
  }

  async getAllCronjobs() {
    return await this.db.list("CRON_");
  }

  async addCronjob(guildId, channelId, prefix = "CRON_") {
    return await this.db.set(prefix + guildId, { guild: guildId, channel: channelId });
  }

  async addThreeByThree(discordId, imageLink, prefix = "3x3_") {
    return await this.db.set(prefix + discordId, imageLink);
  }

  async getThreeByThree(discordId, prefix = "3x3_") {
    return await this.db.get(prefix + discordId);
  }

  async addThreeByThreeManga(discordId, imageLink, prefix = "3x3M_") {
    return await this.db.set(prefix + discordId, imageLink);
  }

  async getThreeByThreeManga(discordId, prefix = "3x3M_") {
    return await this.db.get(prefix + discordId);
  }
}
const ReplitDatabase = require("@replit/database");

module.exports = class Database {
  constructor() {
    this.db = new ReplitDatabase();
  }
  
  async getUsers() {
    return await this.db.list("USER_");
  }

  async getAniListId(discordId, prefix="USER_") {
    return await this.db.get(prefix + discordId);
  }

  async addUser(discordId, anilistId, prefix="USER_") {
    return await this.db.set(prefix + discordId, anilistId)
  }

  async getUserIds() {
    const users = await this.getUsers();
    const ids = []
    for (let i in users) {
      ids.push(await this.getAniListId(users[i], ""))
    }
    return ids;
  }

  async getGuildChannelList(guildId, prefix="GUILD_") {
    return await this.db.get(prefix + guild);
  }

}
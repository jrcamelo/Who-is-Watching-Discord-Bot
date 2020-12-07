const BaseCommand = require("./Base.js");
const ProfileCommand = require("./Profile");

class ProfileCompactCommand extends ProfileCommand {
  static command = "p";

  async getEmbed(user) {
    return user.makeAniListProfileCompactEmbed();
  }
}
module.exports = ProfileCompactCommand;
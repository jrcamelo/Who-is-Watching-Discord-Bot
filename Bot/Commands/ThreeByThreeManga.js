const ThreeByThreeCommand = require("./ThreeByThree.js");

class ThreeByThreeMangaCommand extends ThreeByThreeCommand {
  static command = "3x3m";
  static helpTitle = "Sets or shows the user's manga 3x3.";

  async setThreeByThree(three) {
    return three.setThreeByThreeManga();
  }

  async getThreeByThree(three) {
    return three.getThreeByThreeManga();
  }

}
module.exports = ThreeByThreeMangaCommand;
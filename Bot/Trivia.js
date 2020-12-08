const Bot = require("./Bot");

function addAnimeTriviaFooter(embed) {
  const roll = Math.random();
  if (roll > 0.99) {
    embed.setFooter("Megumin is best girl!", Bot.getOwnerPicture())
  } else if (roll < 0.1) {
    embed.setFooter("Try w.a for a compact version of this command.", Bot.getProfilePicture())
  } else if (roll < 0.2) {
    embed.setFooter("React with 💥 to delete bot messages.", Bot.getProfilePicture());
  }
  return embed;
}

module.exports.addAnimeTriviaFooter = addAnimeTriviaFooter
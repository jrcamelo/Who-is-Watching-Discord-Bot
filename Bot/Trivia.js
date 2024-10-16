const Bot = require("./Bot");

function addAnimeTriviaFooter(embed) {
  const roll = Math.random();
  if (roll > 0.995) {
    embed.setFooter({ text: "Megumin is best girl!", iconURL: Bot.getOwnerPicture() })
  } else if (roll < 0.1) {
    embed.setFooter({ text: "Try w.a for a compact version of this command.", iconURL: Bot.getProfilePicture() })
  } else if (roll < 0.2) {
    embed.setFooter({ text: "React with 💥 to delete bot messages.", iconURL: Bot.getProfilePicture() });
  }
  return embed;
}

module.exports.addAnimeTriviaFooter = addAnimeTriviaFooter
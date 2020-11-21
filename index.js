const Bot = require("./Bot")
Bot.initialize()



// Test
async function test() {
  console.log(await Bot.db.getUsers());
  console.log(await Bot.db.getUserIds());
}
test();
const Link = require("./Commands/Link")
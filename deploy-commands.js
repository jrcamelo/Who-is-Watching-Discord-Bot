require("dotenv").config();
const { REST, Routes } = require("discord.js");
const definitions = require("./Bot/CommandDefinitions");

const clientId = process.env.CLIENT_ID || "779410230597255188";
const token = process.env.BOT_TOKEN;
const testGuildId = process.env.TEST_GUILD_ID || "861071690498572328";
const testDeployment = process.argv.includes("--guild");

if (!token) {
  throw new Error("BOT_TOKEN is required.");
}

const rest = new REST({ version: "10" }).setToken(token);
const route = testDeployment
  ? Routes.applicationGuildCommands(clientId, testGuildId)
  : Routes.applicationCommands(clientId);

(async () => {
  const scope = testDeployment ? `guild ${testGuildId}` : "global";
  await rest.put(route, { body: definitions.map(command => command.toJSON()) });
  console.log(`Deployed ${definitions.length} slash commands to ${scope}.`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

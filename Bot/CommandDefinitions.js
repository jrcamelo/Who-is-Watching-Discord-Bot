const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ApplicationIntegrationType,
  InteractionContextType,
} = require("discord.js");

function guildCommand(command) {
  return command
    .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
    .setContexts(InteractionContextType.Guild);
}

const definitions = [
  guildCommand(new SlashCommandBuilder().setName("link").setDescription("Link your AniList account.")
    .addStringOption(option => option.setName("username").setDescription("Your AniList username.").setRequired(true))),
  guildCommand(new SlashCommandBuilder().setName("profile").setDescription("Show a linked AniList profile.")
    .addUserOption(option => option.setName("user").setDescription("Linked Discord user."))
    .addBooleanOption(option => option.setName("compact").setDescription("Use the compact embed."))
    .addBooleanOption(option => option.setName("private").setDescription("Only you can see the response."))),
  guildCommand(new SlashCommandBuilder().setName("anime").setDescription("Search for an anime.")
    .addStringOption(option => option.setName("title").setDescription("Anime title.").setRequired(true))
    .addBooleanOption(option => option.setName("compact").setDescription("Use the compact embed."))
    .addBooleanOption(option => option.setName("private").setDescription("Only you can see the response."))),
  guildCommand(new SlashCommandBuilder().setName("manga").setDescription("Search for a manga.")
    .addStringOption(option => option.setName("title").setDescription("Manga title.").setRequired(true))
    .addBooleanOption(option => option.setName("compact").setDescription("Use the compact embed."))
    .addBooleanOption(option => option.setName("private").setDescription("Only you can see the response."))),
  guildCommand(new SlashCommandBuilder().setName("watching").setDescription("Show a linked user's watchlist.")
    .addUserOption(option => option.setName("user").setDescription("Linked Discord user."))),
  guildCommand(new SlashCommandBuilder().setName("airing").setDescription("Show a linked user's airing anime.")
    .addUserOption(option => option.setName("user").setDescription("Linked Discord user."))),
  guildCommand(new SlashCommandBuilder().setName("feed").setDescription("Show recent AniList activity.")
    .addStringOption(option => option.setName("type").setDescription("Activity type.").addChoices(
      { name: "All media", value: "media" }, { name: "Anime", value: "anime" }, { name: "Manga", value: "manga" }))
    .addUserOption(option => option.setName("user").setDescription("Linked Discord user."))
    .addBooleanOption(option => option.setName("private").setDescription("Only you can see the response."))),
  guildCommand(new SlashCommandBuilder().setName("voice-actor").setDescription("Find a character's voice actor.")
    .addStringOption(option => option.setName("character").setDescription("Character name.").setRequired(true))
    .addStringOption(option => option.setName("language").setDescription("Voice-actor language.").addChoices(
      { name: "Japanese", value: "JAPANESE" }, { name: "English", value: "ENGLISH" }))
    .addBooleanOption(option => option.setName("private").setDescription("Only you can see the response."))),
  guildCommand(new SlashCommandBuilder().setName("notice").setDescription("Configure airing notices.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(command => command.setName("set").setDescription("Send airing notices to this channel."))),
  guildCommand(new SlashCommandBuilder().setName("trace").setDescription("Identify an anime screenshot with trace.moe.")
    .addAttachmentOption(option => option.setName("image").setDescription("Screenshot to identify.").setRequired(true))),
  guildCommand(new SlashCommandBuilder().setName("sauce").setDescription("Find an image source with SauceNAO.")
    .addAttachmentOption(option => option.setName("image").setDescription("Image to identify.").setRequired(true))),
  guildCommand(new SlashCommandBuilder().setName("three-by-three").setDescription("Set or show your 3x3 image.")
    .addStringOption(option => option.setName("type").setDescription("3x3 type.").setRequired(true).addChoices(
      { name: "Anime", value: "anime" }, { name: "Manga", value: "manga" }))
    .addAttachmentOption(option => option.setName("image").setDescription("Image to save for yourself."))),
  guildCommand(new SlashCommandBuilder().setName("help").setDescription("Show bot command help.")),
];

module.exports = definitions;

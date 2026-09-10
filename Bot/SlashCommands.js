const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");
const User = require("./User");
const Anime = require("./Anime");
const Manga = require("./Manga");
const Watching = require("./Watching");
const Activities = require("./Activities");
const CharVA = require("./CharVA");
const NoticeManager = require("./NoticeManager");
const TraceMoe = require("./TraceMoe");
const SauceNao = require("./SauceNao");
const ThreeByThree = require("./ThreeByThree");

const navigationLifetime = 10 * 60 * 1000;

function privateReply(interaction) {
  return interaction.options.getBoolean("private") ?? false;
}

function compactReply(interaction) {
  return interaction.options.getBoolean("compact") ?? true;
}

function messageContext(interaction, attachment) {
  return {
    author: interaction.user,
    guild: interaction.guild,
    guildId: interaction.guildId,
    channel: interaction.channel,
    attachments: attachment ? new Collection([[attachment.id, attachment]]) : new Collection(),
    mentions: { users: new Collection() },
  };
}

async function linkedUser(interaction, target = interaction.user) {
  const user = new User(interaction.guildId, target);
  if (!await user.setAniListFromDiscord()) return null;
  return user;
}

async function defer(interaction, ephemeral = false) {
  await interaction.deferReply(ephemeral ? { flags: MessageFlags.Ephemeral } : {});
}

async function fail(interaction, message) {
  return interaction.editReply({ content: message, embeds: [], components: [] });
}

function navigationRow(id, disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`${id}:previous`).setLabel("Previous").setStyle(ButtonStyle.Secondary).setDisabled(disabled),
    new ButtonBuilder().setCustomId(`${id}:next`).setLabel("Next").setStyle(ButtonStyle.Primary).setDisabled(disabled),
  );
}

async function paginatedReply(interaction, makeEmbed, previous, next) {
  const id = `page:${interaction.id}`;
  const message = await interaction.editReply({ embeds: [await makeEmbed()], components: [navigationRow(id)] });
  const collector = message.createMessageComponentCollector({ time: navigationLifetime });

  collector.on("collect", async component => {
    if (component.user.id !== interaction.user.id) {
      await component.reply({ content: "Only the command invoker can change this page.", flags: MessageFlags.Ephemeral }).catch(() => {});
      return;
    }
    await component.deferUpdate();
    try {
      if (component.customId === `${id}:previous`) await previous();
      if (component.customId === `${id}:next`) await next();
      await message.edit({ embeds: [await makeEmbed()], components: [navigationRow(id)] });
    } catch (error) {
      console.error("Pagination update failed:", error);
      await component.followUp({ content: "Could not update this result.", flags: MessageFlags.Ephemeral }).catch(() => {});
    }
  });
  collector.on("end", () => message.edit({ components: [navigationRow(id, true)] }).catch(() => {}));
}

async function executeLink(interaction) {
  await defer(interaction);
  const context = messageContext(interaction);
  const user = new User();
  user.setDiscordFromMessage(context);
  const username = interaction.options.getString("username", true).trim();
  if (!await user.setAniListFromUsername(username)) return fail(interaction, `Could not find AniList user: ${username}`);
  await user.saveLinkedUser();
  await user.saveUserToGuild();
  return interaction.editReply({ embeds: [user.makeAniListProfileEmbed()] });
}

async function executeProfile(interaction) {
  const ephemeral = privateReply(interaction);
  await defer(interaction, ephemeral);
  const user = await linkedUser(interaction, interaction.options.getUser("user") || interaction.user);
  if (!user) return fail(interaction, "AniList user not found. Use /link first.");
  const embed = compactReply(interaction) ? user.makeAniListProfileCompactEmbed() : user.makeAniListProfileEmbed();
  return interaction.editReply({ embeds: [embed] });
}

async function executeMedia(interaction, Type) {
  const ephemeral = privateReply(interaction);
  await defer(interaction, ephemeral);
  const media = new Type(interaction.options.getString("title", true), interaction.guildId);
  if (!await media.search()) return fail(interaction, media.error || "No matching result was found.");
  const makeEmbed = () => compactReply(interaction) ? media.makeEmbedCompact() : media.makeEmbed();
  if (media.searchResult.length < 2) return interaction.editReply({ embeds: [await makeEmbed()] });
  return paginatedReply(interaction, makeEmbed, () => media.previousSearchResult(), () => media.nextSearchResult());
}

async function executeWatching(interaction, airing) {
  await defer(interaction);
  const user = await linkedUser(interaction, interaction.options.getUser("user") || interaction.user);
  if (!user) return fail(interaction, "AniList user not found. Use /link first.");
  const watching = new Watching(user);
  const episodes = airing ? await watching.getAiringEpisodes() : await watching.getEpisodes();
  if (!episodes) return fail(interaction, "No watchlist entries were found.");
  return interaction.editReply({ embeds: [watching.makeEmbed()] });
}

async function executeFeed(interaction) {
  const ephemeral = privateReply(interaction);
  await defer(interaction, ephemeral);
  const selected = interaction.options.getString("type") || "media";
  const type = selected === "anime" ? Activities.type.ANIME : selected === "manga" ? Activities.type.MANGA : Activities.type.MEDIA;
  const target = interaction.options.getUser("user");
  const user = target ? await linkedUser(interaction, target) : null;
  if (target && !user) return fail(interaction, "That user has not linked an AniList account.");
  const feed = new Activities(type, interaction.guildId, user?.anilist.id);
  if (!await feed.getLastActivities()) return fail(interaction, "No linked-user activity was found.");
  const makeEmbed = () => feed.makeEmbed();
  return paginatedReply(interaction, makeEmbed, () => feed.getPreviousPage(), () => feed.getNextPage());
}

async function executeVoiceActor(interaction) {
  const ephemeral = privateReply(interaction);
  await defer(interaction, ephemeral);
  const voiceActor = new CharVA(interaction.options.getString("character", true), interaction.options.getString("language") || "JAPANESE");
  if (!await voiceActor.search()) return fail(interaction, "No matching character was found.");
  const makeEmbed = () => voiceActor.makeEmbed();
  if (voiceActor.searchResult.length < 2) return interaction.editReply({ embeds: [await makeEmbed()] });
  return paginatedReply(interaction, makeEmbed, () => voiceActor.previousSearchResult(), () => voiceActor.nextSearchResult());
}

async function executeNotice(interaction) {
  await defer(interaction, true);
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) return fail(interaction, "Only members with Manage Server can do that.");
  await NoticeManager.setNoticesToChannel({ guild: { id: interaction.guildId }, channel: { id: interaction.channelId } });
  return interaction.editReply("Airing notices will be posted in this channel.");
}

async function executeTrace(interaction) {
  await defer(interaction);
  const attachment = interaction.options.getAttachment("image");
  if (!attachment?.contentType?.startsWith("image/")) return fail(interaction, "Provide an image attachment.");
  const trace = new TraceMoe(messageContext(interaction, attachment), "");
  if (!await trace.setImage()) return fail(interaction, "Could not read that screenshot.");
  if (!await trace.searchWithImage()) return fail(interaction, "trace.moe could not identify that screenshot.");
  const makeEmbed = () => trace.makeEmbed();
  if (trace.searchResult.length < 2) return interaction.editReply({ embeds: [await makeEmbed()] });
  return paginatedReply(interaction, makeEmbed, () => trace.previousSearchResult(), () => trace.nextSearchResult());
}

async function executeSauce(interaction) {
  await defer(interaction);
  const attachment = interaction.options.getAttachment("image");
  if (!attachment?.contentType?.startsWith("image/")) return fail(interaction, "Provide an image attachment.");
  const sauce = new SauceNao(messageContext(interaction, attachment), "");
  if (!await sauce.setImage()) return fail(interaction, "Could not read that image.");
  if (!await sauce.search()) return fail(interaction, "SauceNAO could not find a source.");
  const makeEmbed = () => sauce.makeEmbed();
  if (sauce.searchResult.length < 2) return interaction.editReply({ embeds: [await makeEmbed()] });
  return paginatedReply(interaction, makeEmbed, () => sauce.previousSearchResult(), () => sauce.nextSearchResult());
}

async function executeThreeByThree(interaction) {
  await defer(interaction);
  const attachment = interaction.options.getAttachment("image");
  const three = new ThreeByThree(messageContext(interaction, attachment));
  three.discord = interaction.user;
  three.guild = interaction.guildId;
  const manga = interaction.options.getString("type", true) === "manga";
  if (attachment) {
    if (!await three.setImage()) return fail(interaction, "The attachment must be an image.");
    if (manga) await three.setThreeByThreeManga(); else await three.setThreeByThree();
    return interaction.editReply("3x3 saved.");
  }
  const image = manga ? await three.getThreeByThreeManga() : await three.getThreeByThree();
  if (!image) return fail(interaction, "No 3x3 was found.");
  return interaction.editReply({ embeds: [await three.makeEmbed()] });
}

async function executeHelp(interaction) {
  await defer(interaction, true);
  const embed = new EmbedBuilder().setColor("#26edff").setTitle("Who is Watching commands")
    .setDescription("Profile, anime, and manga use compact embeds by default; set `compact` to false for the full view. " +
      "The `private` option makes supported replies visible only to you. Trace and SauceNAO require an image attachment.")
    .addFields(
      { name: "/link", value: "Link your AniList account.", inline: true },
      { name: "/profile, /anime, /manga", value: "Look up linked profiles and media.", inline: true },
      { name: "/watching, /airing, /feed", value: "Show watchlists, only-airing watchlists, and recent activity.", inline: true },
      { name: "/voice-actor, /trace, /sauce", value: "Discover people and image sources.", inline: true },
      { name: "/three-by-three, /notice", value: "Set or show your own 3x3 image; configure airing notices.", inline: true },
    );
  return interaction.editReply({ embeds: [embed] });
}

async function handle(interaction) {
  if (!interaction.isChatInputCommand() || !interaction.inGuild()) return;
  try {
    switch (interaction.commandName) {
      case "link": return await executeLink(interaction);
      case "profile": return await executeProfile(interaction);
      case "anime": return await executeMedia(interaction, Anime);
      case "manga": return await executeMedia(interaction, Manga);
      case "watching": return await executeWatching(interaction, false);
      case "airing": return await executeWatching(interaction, true);
      case "feed": return await executeFeed(interaction);
      case "voice-actor": return await executeVoiceActor(interaction);
      case "notice": return await executeNotice(interaction);
      case "trace": return await executeTrace(interaction);
      case "sauce": return await executeSauce(interaction);
      case "three-by-three": return await executeThreeByThree(interaction);
      case "help": return await executeHelp(interaction);
    }
  } catch (error) {
    console.error(`Slash command ${interaction.commandName} failed:`, error);
    const payload = { content: "An unexpected error occurred.", flags: MessageFlags.Ephemeral };
    if (interaction.deferred) return interaction.editReply({ content: payload.content, embeds: [], components: [] }).catch(() => {});
    if (interaction.replied) return interaction.followUp(payload).catch(() => {});
    return interaction.reply(payload).catch(() => {});
  }
}

module.exports = { handle, _test: { privateReply, compactReply } };

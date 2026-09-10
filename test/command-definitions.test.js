const test = require("node:test");
const assert = require("node:assert/strict");
const { PermissionFlagsBits } = require("discord.js");
const definitions = require("../Bot/CommandDefinitions");
const { _test } = require("../Bot/SlashCommands");

const commands = definitions.map(command => command.toJSON());

test("registers the complete guild-only slash command surface", () => {
  assert.deepEqual(commands.map(command => command.name), [
    "link", "profile", "anime", "manga", "watching", "airing", "feed",
    "voice-actor", "notice", "trace", "sauce", "three-by-three", "help",
  ]);
  for (const command of commands) {
    assert.deepEqual(command.contexts, [0]);
    assert.deepEqual(command.integration_types, [0]);
  }
});

test("uses the requested response options and secure notice default", () => {
  for (const name of ["profile", "anime", "manga"]) {
    assert.ok(commands.find(command => command.name === name).options.some(option => option.name === "compact"));
  }
  for (const name of ["profile", "anime", "manga", "feed", "voice-actor"]) {
    assert.ok(commands.find(command => command.name === name).options.some(option => option.name === "private"));
  }
  assert.equal(commands.find(command => command.name === "notice").default_member_permissions, PermissionFlagsBits.ManageGuild.toString());
});

test("restricts image sources and 3x3 writes to the invoker", () => {
  for (const name of ["trace", "sauce"]) {
    const image = commands.find(command => command.name === name).options.find(option => option.name === "image");
    assert.equal(image.required, true);
    assert.equal(commands.find(command => command.name === name).options.some(option => option.name === "url"), false);
  }
  assert.equal(commands.find(command => command.name === "three-by-three").options.some(option => option.name === "user"), false);
  assert.equal(commands.find(command => command.name === "three-by-three").description, "Set or show your 3x3 image.");
});

test("uses compact responses by default and private responses only when requested", () => {
  const options = values => ({ getBoolean: name => values[name] ?? null });
  assert.equal(_test.compactReply({ options: options({}) }), true);
  assert.equal(_test.compactReply({ options: options({ compact: false }) }), false);
  assert.equal(_test.privateReply({ options: options({}) }), false);
  assert.equal(_test.privateReply({ options: options({ private: true }) }), true);
});

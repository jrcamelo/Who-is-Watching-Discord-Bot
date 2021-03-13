const Discord = require('discord.js');
const { htmlToText } = require('html-to-text');

const Bot = require("./Bot");
const Utils = require("./Utils");
const AniListNode = require("../ModifiedAniListNode/");

const AniList = new AniListNode();

module.exports = class CharVA {
  constructor(name) {
    this.name = name;
  }

  async search() {
    const result = await this.searchCharacter();
    if (result == null || result.status == 404 || !result.Page.characters) return null // Check if no results
    this.searchResult = this.cleanResults(result.Page.characters);
    this.index = 0;
    this.character = this.searchResult[this.index];
    this.va = await this.getVA(this.index);
    return this.searchResult;
  }

  async searchCharacter() {
    return await AniList.va.character(this.name);
  }

  async nextSearchResult() {
    const limit = this.searchResult.length
    this.index = (limit + this.index + 1) % limit;
    this.character = this.searchResult[this.index];
    this.va = await this.getVA(this.index);
    return this.character;
  }

  async previousSearchResult() {
    const limit = this.searchResult.length
    this.index = (limit + this.index - 1) % limit;
    this.character = this.searchResult[this.index];
    this.va = await this.getVA(this.index);
    return this.character;
  }

  cleanResults(results) {
    let characters = [];
    for (let i = 0; i < results.length; i++) {
      let char = this.parseCharacter(results[i]);
      if (char) {
        characters.push(char);
      }
    }
    return characters;
  }

  parseCharacter(character) {
    let name = character.name.full;
    let image = character.image.medium;
    let result = null;
    let characters = character.media.edges;
    for (let i = 0; i < characters.length; i++) {
      let anime = this.parseCharacterInAnime(characters[i]);
      if (anime.va) {
        if (!result || anime.favourites > result.favourites) {
          result = anime;
          result.name = name;
          result.image = image;
        }
      }
    }
    return result;
  }

  parseCharacterInAnime(anime) {
    let char = {};
    char.id = anime.id;
    char.title = anime.node.title.romaji;
    char.favourites = anime.node.favourites;
    for (let va of anime.voiceActors) {
      if (va.language == "JAPANESE") {
        char.va = va.id;
        break;
      }
    }
    return char;
  }

  async getVA(index) {
    return await AniList.va.voiceActor(this.searchResult[index].va);
  }

  async makeEmbed() {
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(this.va.Staff.name.full)
      .setAuthor(this.character.name + " - " + this.character.title)
      .setURL(this.va.Staff.siteUrl)
      .setThumbnail(this.va.Staff.image.large)
      .setDescription(this.makeDescription())
      .setFooter(`${this.index + 1}/${this.searchResult.length}`)
    return embed;
  }

  makeDescription() {
    let text = "";
    let characters = this.getVACharacters();
    for (let i = 0; i < characters.length && i < 8; i++) {
      text += `**${characters[i].name}** - ${characters[i].anime}\n`;
    }
    if (characters.length > 10) {
      text += `...and ${characters.length - 8} more`;
    }
    return text;
  }

  getVACharacters() {
    let characters = []
    if (!this.va.Staff.characters || !this.va.Staff.characters.edges) {
      return "";
    }
    let edges = this.va.Staff.characters.edges;
    for (let i = 0; i < edges.length; i++) {
      let char = {}
      char.name = edges[i].node.name.full;
      char.favourites = edges[i].node.favourites;
      if (edges[i].media) {
        char.anime = edges[i].media[0].title.romaji;
      } else {
        char.anime = "?";
      }
      characters.push(char);
    }
    characters.sort((a, b) => (b.favourites - a.favourites));
    return characters;
  }
}
  
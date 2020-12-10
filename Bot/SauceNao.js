require('dotenv').config()
const API_TOKEN = process.env.SAUCENAO_TOKEN;

const Sagiri = require('sagiri');
const Discord = require('discord.js');
const ImageFetch = require('fetch-base64')
const Fetch = require('node-fetch');
const IsImage = require('is-image-url')
const Bot = require("./Bot");
const Utils = require("./Utils");
const Anime = require("./Anime")

const MAX_RESULTS = 10;
const Sauce = Sagiri(API_TOKEN, { results: MAX_RESULTS });

const siteUrl = "https://saucenao.com/"

module.exports = class SauceNao {
  constructor(message, link) {
    this.message = message;
    this.link = link;
    this.index = 0;
  }

  async setImage() {
    this.setImageFromAttachmentOrLink();
    if (!this.image) {
      await this.getImageAbove();
    }
    return this.image;
  }

  setImageFromAttachmentOrLink() {
    if (this.message.attachments.size > 0) {
      const attachment = this.message.attachments.values().next().value.url;
      if (IsImage(attachment)) {
        this.image = attachment;
      } else {
        console.log(attachment + " is not an image");
      }
    } else {
      if (IsImage(this.link)) {
        this.image = this.link;
      } else {
        console.log(this.link + " is not an image");
      }
    }
  }

  async getImageAbove() {
    const fetchedMessages = await this.message.channel.messages.fetch({ limit: 10 });
    const sortedIds = [...fetchedMessages.keys()].sort().reverse();
    for (const id of sortedIds) {
      const message = fetchedMessages.get(id);
      const image = this.setImageFromFetchedMessage(message);
      if (image) {
        this.image = image;
        break;
      }
    }
  }

  setImageFromFetchedMessage(message) {
    if (!message) return;
    const link = message.content;
    if (message.attachments.size > 0) {
      const attachment = message.attachments.values().next().value.url;
      if (IsImage(attachment)) {
        return attachment;
      }
    } else {
      if (IsImage(link)) {
        return link;
      }
    }
  }  

  async search() {
    try {
      this.searchResult = await Sauce(this.image);
    } catch(e) {
      console.log(e);
    }
    if (!this.searchResult) return null;
    this.sauce = this.searchResult[0];
    return this.searchResult;
  }

  nextSearchResult() {
    const limit = this.searchResult.length
    this.index = (limit + this.index + 1) % limit;
    this.sauce = this.searchResult[this.index];
    return this.sauce;
  }

  previousSearchResult() {
    const limit = this.searchResult.length
    this.index = (limit + this.index - 1) % limit;
    this.sauce = this.searchResult[this.index];
    return this.sauce;
  }

  async makeEmbed() {
    let embed = new Discord.MessageEmbed()
      .setTitle("Found sauce at " + this.sauce.site)
      .setURL(this.sauce.url)
      .setThumbnail(this.image)
      .setImage(this.sauce.thumbnail)
      .addFields([this.makeSimilarityField()])
      .setFooter(`${this.index + 1}/${this.searchResult.length} - ${siteUrl}`)
    const authorField = this.makeAuthorField();
    if (authorField) { 
      embed.addFields([authorField]);
    }
    return await embed;
  }

  makeSimilarityField() {
    const similarity = Math.round(this.sauce.similarity)
    return { name: "Confidence", value: `${similarity}%`, inline: true };
  }

  makeAuthorField () {
    if (this.sauce.authorName) {
      const author = this.sauce.authorUrl ?
        `[${this.sauce.authorName}](${this.sauce.authorUrl})`
        : this.sauce.authorName;
      return { name: "Author", value: author, inline: true };
    }
    return null;
  }
}

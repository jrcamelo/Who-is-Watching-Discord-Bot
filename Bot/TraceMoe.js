const Discord = require('discord.js');
const ImageFetch = require('fetch-base64')
const Fetch = require('node-fetch');
const IsImage = require('is-image-url')
const Bot = require("./Bot");
const Utils = require("./Utils");
const Anime = require("./Anime")

const siteUrl = "https://trace.moe/";
const searchUrl = `https://trace.moe/api/search`;

module.exports = class TraceMoe {
  constructor(message, link) {
    this.message = message;
    this.link = link;
    this.index = 0;
  }

  async setImage() {
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
    this.base64 = await this.convertImageToBase64();
    if (!this.base64) return null;
    return this.image;
  }

  async convertImageToBase64() {
    try {
      const base64 = await ImageFetch.remote(this.image)
      return base64[0]
    } catch {
      return null;
    }
  }

  async searchWithImage() {
    const response = await this.sendPost();
    if (!response) return;
    return this.parseResponse(response);
  }

  async sendPost() {
    const body = new URLSearchParams(`image=${this.base64}`);
    const options = { method: "POST", body }
    const post = await Fetch(`https://api.trace.moe/search?anilistInfo&url=${encodeURIComponent(this.image)}`)
    return await post.json();
  }

  parseResponse(response) {
    if (!response.result) return;
    this.searchResult = response.result;
    this.source = response.result[0];
    return this.source;
  }

  async makeEmbed() {
    let embed = new Discord.MessageEmbed()
      .setTitle(this.getTitle())
      .setURL(Utils.makeAnilistAnimeUrl(this.source.anilist.id))
      .setThumbnail(this.source.image)
      .setImage(this.source.image)
      .addFields([this.makeAnimeField(), this.makeSimilarityField()])
      .setFooter(`${this.index + 1}/${this.searchResult.length} - ${siteUrl}`)
    return embed;
  }

  makeAnimeField() {
    const episode = `Episode ${this.source.episode}`;
    const time = Utils.secondsToTime(+this.source.from);
    return { name: episode, value: `At ${time}`, inline: true }
  }

  makeSimilarityField() {
    const similarity = Math.round(this.source.similarity * 100)
    return { name: "Confidence", value: `${similarity}%`, inline: true };
  }

  getImagePreview() {
    const { anilist, filename, at, tokenthumb } = this.source;
    return `https://trace.moe/thumbnail.php?anilist_id=${anilist.id}&file=${encodeURIComponent(filename)}&t=${at}&token=${tokenthumb}`
  }

  nextSearchResult() {
    const limit = this.searchResult.length
    this.index = (limit + this.index + 1) % limit;
    this.source = this.searchResult[this.index];
    return this.source;
  }

  previousSearchResult() {
    const limit = this.searchResult.length
    this.index = (limit + this.index - 1) % limit;
    this.source = this.searchResult[this.index];
    return this.source;
  }

  getTitle() {
    return this.source.anilist.title.romaji;
  }

}

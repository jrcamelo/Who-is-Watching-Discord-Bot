const Discord = require('discord.js');
const { htmlToText } = require('html-to-text');

const Media = require("./Media");
const Bot = require("./Bot");
const Utils = require("./Utils");
const { addAnimeTriviaFooter } = require("./Trivia");
const AniListNode = require("../ModifiedAniListNode/");

const AniList = new AniListNode();

class Anime extends Media {
  constructor(title, guildId) {
    super(title, guildId);
  }

  async getSearchResults(title) {
    return AniList.media.pageAnime(this.title);
  }

  async makeEmbed() {
    let embed = new Discord.MessageEmbed()
      .setColor(this.media.coverImage.color || '#0099ff')
      .setTitle(this.media.title.romaji)
      .setURL(this.media.siteUrl)
      .setThumbnail(this.media.coverImage.large)
      .setImage(this.media.bannerImage)
      .addFields(this.makeAiredFields())
      .addFields(this.makeAiringOrCompletedFields())
      .addFields(await this.makeWatchingFields())
      .setFooter(`${this.index + 1}/${this.searchResult.length}`,Bot.getProfilePicture())
    embed = addAnimeTriviaFooter(embed);
    return embed;
  }

  async makeEmbedCompact() {
    const embed = new Discord.MessageEmbed()
      .setColor(this.media.coverImage.color || '#0099ff')
      .setTitle(this.media.title.romaji)
      .setURL(this.media.siteUrl)
      .setThumbnail(this.media.coverImage.large)
      .setFooter(`${this.index + 1}/${this.searchResult.length} - ` + this.makeAiringOrCompletedFooter(), Bot.getProfilePicture())
      .addFields(await this.makeWatchingFields());
    return embed;
  }

  makeAiredFields() {
    const fields = [
        { name: this.media.format, value: (this.media.episodes || "?").toString() + ' episode(s)', inline: true },
        { name: 'Aired at', value: this.media.season + " " + this.media.seasonYear, inline: true }
    ]
    return fields;
  }

  makeAiringOrCompletedFields(inline = true) {
    if (this.media.nextAiringEpisode && 
        this.media.nextAiringEpisode.episode != null && 
        this.media.nextAiringEpisode.timeUntilAiring) {
      const nextEpisode = this.media.nextAiringEpisode.episode.toString()
      const timeLeft = Utils.parseTimeLeft(this.media.nextAiringEpisode.timeUntilAiring)
      return [
          { name: `Episode ${nextEpisode}`, value: `${timeLeft} left`, inline: inline}
      ];
    } else {
      return [
          { name: this.media.status, value: "No airing episodes", inline: inline}
      ];
    }
  }

  makeAiringOrCompletedFooter() {
    if (this.media.nextAiringEpisode) {
      const nextEpisode = this.media.nextAiringEpisode.episode.toString()
      const timeLeft = Utils.parseTimeLeft(this.media.nextAiringEpisode.timeUntilAiring)
      return `Episode ${nextEpisode} in ${timeLeft}`;
    }
    else {
      return `${this.media.status}`;
    }
  }

  async makeWatchingFields() {
    const usersWatching = await this.sortedWhoIsWatching();
    
    let watchList = { name: "Watching: ", count: 0, value: "", inline: true };
    let completeList = { name: "Completed: ", count: 0, value: "", inline: true };
    let otherList = { name: "Others: ", count: 0, value: "", inline: true };
    while(usersWatching.length > 0) {
      const watching = usersWatching.pop()
      const updateTime = Utils.parseUpdateTime(watching.updatedAt);
      const score = this.getFormattedScore(watching);
      const repeat = watching.repeat ?
          ` (${watching.repeat + 1}x)`
          : "";
      switch(watching.status) {
        case "CURRENT":          
          watchList = this.addToList(watchList, 
              `**${watching.user.name}**${repeat}: Ep. ${watching.progress}${updateTime}`)
          break
        case "COMPLETED":
          completeList = this.addToList(completeList, 
              `**${watching.user.name}**${repeat}:${score}${updateTime}`)
          break;
        default:
          otherList = this.addToList(otherList, 
            `**${watching.user.name}**: ${watching.status}${score}`)
          break;
      }
    }

    const fields = []
    if (watchList.count) fields.push(watchList);
    if (completeList.count) fields.push(completeList);
    if (otherList.count) fields.push(otherList);
    return fields;
  }

  addToList(list, text) {
    list.count += 1;
    if (list.value) list.value += "\n";
    list.value += text;
    return list;
  }

  async getWatchingMedia(users) {
    return AniList.who.watchingAnime(users, this.media.id);
  }
}

module.exports = Anime;
const fetch = require("node-fetch");

/**
 * Edit a person's name data object for better use.
 * @private
 * @param { Object } obj - A name object of the person. 
 * @returns { Object } An edited object of the person.
 */
function nameEditor(obj) {
    if (obj.alternative.length < 1 || obj.alternative[0] == "") { obj.alternative = null; }

    if (obj.full && obj.english === null) {
        obj.english = obj.full;
        delete obj.full;
    }

    return obj;
}

/**
 * Moves data up levels in the object for better use.
 * @private
 * @param { Object } obj - Required. The object to edit.
 * @returns { Object } Returns the edited object. 
 */
function edgeRemove(obj) {
    var list = [];
    for (var x = 0; x < obj.length; x++) {
        if (obj[x].name) { 
            obj[x].name = obj[x].name.english || obj[x].name.full; 
        }

        if (obj[x].node) { list.push(obj[x].node); }
        else if (obj[x].id && obj[x].length === 1) { list.push(obj[x].id); }
        else if (obj[x].url) { list.push(obj[x].url); }
        else { list.push(obj[x]); }
    }; 

    if (list.length < 1) { list = null; }
    return list;
}

/**
 * Converts a fuzzyDate into a Javascript Date
 * @private
 * @param { fuzzyDate } fuzzyDate - Date provided by AniList's API.
 * @returns { Date } Returns a date object of the data provided.
 */
function convertFuzzyDate(fuzzyDate) {
    if (Object.values(fuzzyDate).some(d => d === null)) return null;
    return new Date(fuzzyDate.year, fuzzyDate.month - 1, fuzzyDate.day);
}

/**
 * Formats the media data to read better.
 * @private
 * @param { Object } media 
 */
async function formatMedia(media) {
    media.reviews = (media.reviews.nodes.length === 0) ? null : media.reviews.nodes;

    media.externalLinks = await edgeRemove(media.externalLinks);
    media.characters = await edgeRemove(media.characters.nodes);
    media.staff = await edgeRemove(media.staff.nodes);

    if (media.airingSchedule) { media.airingSchedule = media.airingSchedule.nodes; }
    if (media.studios) { media.studios = media.studios.nodes; }
    media.recommendations = media.recommendations.nodes;
    media.relations = media.relations.nodes;
    media.trends = media.trends.nodes;
    
    if (media.synonyms.length < 1) { media.synonyms = null; }

    if (media.trailer) {
        switch (media.trailer.site) {
            case "youtube": media.trailer = `https://www.youtube.com/watch?v=${media.trailer.id}`; break;
            case "dailymotion": media.trailer = `https://www.dailymotion.com/video/${media.trailer.id}`; break;
            case undefined: media.trailer = null; break;
            default: media.trailer = media.trailer; break;
        } 
    }
    return media;
}

module.exports = {
  /**
   * Send a call to the AniList API with a query and variables.
   * @param { String } query 
   * @param { Object } variables 
   * @returns { Object } Returns a customized object containing all of the data fetched.
   */
  send: async function(query, variables) {
    if (!query || !variables) { throw new Error("Query or variables are not given!"); }
    var options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ query: query, variables: variables })
    };
    console.log(variables)
    if (this.key) { options.headers.Authorization = `Bearer ${this.key}`; }
    var response = await fetch("https://graphql.anilist.co", options);
    var json = await response.json();

    if (json.errors && json.errors[0].status === 404) { return { data: null, status: 404, message: "Search item by that term is not found." } }
    if (json.data === null) { return { data: null, status: json.errors[0].status, message: json.errors[0].message } } 

    return json.data;
  }
};
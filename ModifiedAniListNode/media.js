class Media {
    /**
     * @description This constructor is meant for internal use and is apart of initializing. You cannot access this
     * through the AniList class and are not expect to.
     * @param { Utilites } utilities - The AniList Utilities class.
     * @hideconstructor
     */
    constructor(utilities) {
        this.util = utilities;
    };

    /**
     * Fetch an anime entry by its AniList ID.
     * @param { Number } id - Required. The ID tied to the AniList entry.
     * @returns { Object } Returns a customized data object.
     * @since 1.0.0
     */
    anime(search) {
        if (!search) { throw new Error("Anime is not provided!"); }

        return this.util.send(`query ($search: String) { 
          Media (search: $search, type: ANIME) { 
            id 
            idMal 
            title { 
              romaji 
              english 
            } 
            format 
            episodes 
            description 
            status
            startDate { 
              year 
              month 
              day 
            } 
            endDate { 
              year 
              month 
              day 
            }
            season 
            seasonYear 
            duration 
            countryOfOrigin 
            coverImage { 
              large:extraLarge 
              color 
            }
            bannerImage 
            genres 
            synonyms 
            averageScore 
            meanScore 
            nextAiringEpisode { 
              timeUntilAiring 
              airingAt 
              episode 
            } 
            siteUrl 
            } }`, 
            { search: search });
    };

    pageAnime(search, page=1) {
        if (!search) { throw new Error("Anime is not provided!"); }

        return this.util.send(`query ($search: String, $page: Int) {
          Page (page: $page, perPage: 10) {
            media (search: $search, type: ANIME) { 
              id 
              idMal 
              title { 
                romaji 
                english 
              } 
              format 
              episodes 
              description 
              status
              startDate { 
                year 
                month 
                day 
              } 
              endDate { 
                year 
                month 
                day 
              }
              season 
              seasonYear 
              duration 
              countryOfOrigin 
              coverImage { 
                large:extraLarge 
                color 
              }
              bannerImage 
              genres 
              synonyms 
              averageScore 
              meanScore 
              nextAiringEpisode { 
                timeUntilAiring 
                airingAt 
                episode 
              } 
              siteUrl 
            } } }`, 
            { search: search, page: page });
    };


    /**
     * Fetch a manga entry by its AniList ID.
     * @param { Number } id - Required. The ID tied to the AniList entry.
     * @returns { Object } Returns a customized data object.
     * @since 1.0.0
     */
    manga(search) {
        if (!search) { throw new Error("Manga is not provided!"); }
        return this.util.send(`query ($search: String) { 
          Media (search: $search, type: MANGA) { 
            id 
            idMal 
            title { 
              romaji 
              english 
            }
            description 
            format 
            status 
            startDate { 
              year 
              month 
              day 
            } 
            endDate { 
              year 
              month 
              day 
            } 
            chapters 
            volumes 
            coverImage { 
              large:extraLarge 
              color 
            } 
            bannerImage 
            genres 
            synonyms 
            averageScore 
            meanScore 
            siteUrl 
            } }`, { search: search });
    };


    pageManga(search, page=1) {
        if (!search) { throw new Error("Manga is not provided!"); }
        return this.util.send(`query ($search: String, $page: Int) {
          Page (page: $page, perPage: 10) {
            media (search: $search, type: MANGA) { 
              id 
              idMal 
              title { 
                romaji 
                english 
              }
              description 
              format 
              status 
              startDate { 
                year 
                month 
                day 
              } 
              endDate { 
                year 
                month 
                day 
              } 
              chapters 
              volumes 
              coverImage { 
                large:extraLarge 
                color 
              } 
              bannerImage 
              genres 
              synonyms 
              averageScore 
              meanScore 
              siteUrl 
            } } }`, { search: search, page: page });
    };
};

module.exports = Media;
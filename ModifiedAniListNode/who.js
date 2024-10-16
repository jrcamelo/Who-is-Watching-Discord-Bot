class Who {
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
    watchingAnime(users, anime) {
        if (!users) { throw new Error("Users not provided!"); }
        if (!anime) { throw new Error("Anime is not provided!"); }
        return this.util.send(`query ($users: [Int], $anime: Int) { 
          Page (page: 1, perPage: 30) { 
            mediaList (
              userId_in: $users, 
              type: ANIME, 
              mediaId: $anime) 
            { 
              user { 
                name 
                mediaListOptions {
                  scoreFormat
                }
              } 
              progress 
              score 
              status 
              updatedAt 
              completedAt { year month day }
              repeat
            } } }`, { users: users, anime: anime });
    };

    /**
     * Fetch a manga entry by its AniList ID.
     * @param { Number } id - Required. The ID tied to the AniList entry.
     * @returns { Object } Returns a customized data object.
     * @since 1.0.0
     */
    readingManga(users, manga) {
        if (!users) { throw new Error("Users not provided!"); }
        if (!manga) { throw new Error("Manga is not provided!"); }
        return this.util.send(`query ($users: [Int], $manga: Int) { 
          Page (page: 1, perPage: 30) { 
            mediaList (
              userId_in: $users, 
              type: MANGA, 
              mediaId: $manga) 
            { user { 
                name 
                mediaListOptions {
                  scoreFormat
                }
              } 
              progress 
              score 
              status 
              updatedAt 
            } } }`, { users: users, manga: manga });
    };
};

module.exports = Who;
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
        return this.util.send(`query ($users: [Int], $anime: Int) { Page (page: 1, perPage: 14) { Watching:mediaList (userId_in: $users, type: ANIME, mediaId: $anime) { user { name } progress score status updatedAt } } }`, { users: users, anime: anime });
    };

    /**
     * Fetch a manga entry by its AniList ID.
     * @param { Number } id - Required. The ID tied to the AniList entry.
     * @returns { Object } Returns a customized data object.
     * @since 1.0.0
     */
    readingManga(search) {
        if (!search) { throw new Error("Manga is not provided!"); }
        return this.util.send(`query ($search: String) { Media (search: $search, type: MANGA) { id idMal title { romaji english native userPreferred }
            description format status startDate { year month day } endDate { year month day } chapters volumes coverImage { large:extraLarge color } bannerImage genres synonyms averageScore meanScore siteUrl } }`, { search: search });
    };
};

module.exports = Who;
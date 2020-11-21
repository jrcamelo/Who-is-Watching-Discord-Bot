const profileQuery = `id name about avatar { large, medium } bannerImage siteUrl options { profileColor }
statistics { anime { count meanScore } manga { count meanScore } }
favourites {
    anime { nodes { title { romaji } type } }
    manga { nodes { title { romaji } type } }
    characters { nodes { name { english: full } } }
    staff { nodes { name { english: full } } }
    studios { nodes { name } } }`;

class User {
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
     * Fetch a user's AniList basic profile.
     * @param { Number | String } user - Required. Can either be the username or the AniList ID.
     * @returns { UserProfile }
     * @since 1.0.0
     */
    profile(user) {
        var queryVars = this.util.generateQueryHeaders("User", user);
        
        return this.util.send(`${queryVars[1]}${profileQuery}}}`, queryVars[0]);
    };

    /**
     * Fetch a user's AniList stats.
     * @param { Number | String } user - Required. Can either be the username or the AniList ID.
     * @returns { UserStats }
     * @since 1.3.0
     */
    stats(user) {
        var queryVars = this.util.generateQueryHeaders("User", user);
        return this.util.send(`${queryVars[1]}${statsQuery}}}`, queryVars[0]);
    };

    /**
     * Fetch a user's AniList profile, basic and stats.
     * @param { Number | String } user - Required. Can either be the username or the AniList ID.
     * @returns { Object } Returns all keys within {@link UserProfile} and {@link UserStats}. UserStats are found under the statistics key.
     * @since 1.0.0
     */
    all(user) {
        var queryVars = this.util.generateQueryHeaders("User", user);
        return this.util.send(`${queryVars[1]}${profileQuery} ${statsQuery}}}`, queryVars[0]);
    }

    /**
     * Fetch recent activity from a user.
     * @param {Number} user - Required. Needs to be the user's AniList ID.
     * @returns { Object[] } Returns the 25 most recent activities of the user. Contains any number of 
     * {@link ListActivity}, {@link TextActivity}, {@link MessageActivity}. All of which are identifyable by the type key.
     * 
     * @since 1.6.0
     */
    getRecentActivity(user) {
        if (typeof user !== "number") { throw new Error("Term does not match the required types!"); }

        return this.util.send(`query ($page: Int, $perPage: Int, $user: Int) {
            Page (page: $page, perPage: $perPage) { pageInfo { total currentPage lastPage hasNextPage perPage } 
            activities(userId: $user, sort:ID_DESC) {
                ... on ListActivity { id status type progress media { id title { romaji english native userPreferred } type  }
                    createdAt likeCount replies { id text likeCount } }
                ... on TextActivity { id userId type text createdAt likeCount replies { id text likeCount } }
                ... on MessageActivity { id recipientId type message createdAt likeCount replies { id text likeCount } }
            } } }`, { user: user, page: 1, perPage: 25 });
    } 
};

module.exports = User;
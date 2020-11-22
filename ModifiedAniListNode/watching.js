class Watching {
    constructor(utilities) {
        this.util = utilities;
    };

    anime(user) {
      if (!user) { throw new Error("User is not provided!"); }
      return this.util.send(
          `query($user: Int) {
            Page(page:1, perPage:100)
            {
              Watching:mediaList(
                userId:$user,
                type:ANIME,
                status:CURRENT,            
                sort: UPDATED_TIME_DESC,
              ) 
              {
                mediaId
                progress
                updatedAt
              }
          } }`, { user: user });
    };

    airingEpisodes(ids, page = 1) {
      if (!ids) { throw new Error("Anime IDs are not provided!"); }
      return this.util.send(
          `query($ids: [Int], $page: Int) {
              Page(page:$page, perPage:20) {
              media(
                id_in: $ids
              ) 
              {      
                nextAiringEpisode {
                  episode
                  timeUntilAiring
                }
                episodes
                title {
                  romaji
                } 
                id
                siteUrl
              }
          } }`, { ids: ids, page: page });      
    }
};

module.exports = Watching;
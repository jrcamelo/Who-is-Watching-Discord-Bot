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
                status_in: [CURRENT, REPEATING],            
                sort: UPDATED_TIME_DESC,
              ) 
              {
                mediaId
                media {
                  status
                }
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
                id_in: $ids,
                sort: FAVOURITES_DESC
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

    lastActivities(ids, page=1, type=ANIME_LIST) {
      if (!ids) { throw new Error("Anime IDs are not provided!"); }
      return this.util.send(
          `query($ids: [Int], $page: Int, $type: ActivityType) {
                Page(page:$page, perPage:10){
                  activities(userId_in: $ids, sort: ID_DESC, type: $type) {
                    ...on ListActivity {
                      user {
                        name
                      }
                      media {
                        title {
                          romaji
                        }
                        episodes
                        chapters
                        type
                      }
                      progress
                      status
                      createdAt
                    }
                  }
                }
          }`, { ids: ids, page: page, type: type });   
    }

    animeFromEveryUser(ids, page) {
      if (!ids) { throw new Error("Anime IDs are not provided!"); }
      return this.util.send(
          `query($ids: [Int], $page: Int) {
            Page(page:$page, perPage:50)
            {
              Watching:mediaList(
                userId_in: $ids,
                type: ANIME,
                status_in: [CURRENT, PLANNING],      
                sort: UPDATED_TIME_DESC,
              ) {
                  mediaId
                  media {
                    title {
                      romaji
                    }
                    nextAiringEpisode {
                      episode
                      timeUntilAiring
                    }
                    episodes
                    siteUrl
                  }
              }
            }
          }`, { ids: ids, page: page });  
    };
};

module.exports = Watching;
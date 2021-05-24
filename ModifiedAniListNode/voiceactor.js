class VoiceActor {
    constructor(utilities) {
        this.util = utilities;
    };

    character(name) {
      if (!name) { throw new Error("Name is not provided"); }
      return this.util.send(
        `
        query($name: String) {
          
          Page(page:1, perPage:20){
          characters(search: $name, sort: SEARCH_MATCH) {
            id,
            name {
              full
            },
            image {
              medium
            },
            media {
              edges {
                id,
                node {
                  id,
                  favourites,
                  title {
                    romaji
                  }
                },
                voiceActors {
                  id,
                  language
                }
              }
            }
          }
        }
      }
      `, { name: name});
    }

    voiceActor(id) {
      if (!id) { throw new Error("Staff ID is not provided"); }
      return this.util.send(
        `
        query($id: Int){  
          Staff(id:$id) {
            id,
            name {
              full
            },
            siteUrl,
            image {
              large
            },
            characters {
              edges {
                id,
                media {
                  title {
                    romaji
                  }
                },
                node {
                  name {
                    full
                  },
                  favourites,
                }
              }
            }
          }
        }
        `, { id: id});
    }
};

module.exports = VoiceActor;
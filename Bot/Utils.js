const times = {
  SECONDS: 1,
  MINUTES: 60,
  HOURS: 60*60,
  DAYS: 60*60*24,
  YEARS: 60*60*24*365
}

const scoreFormatMultipliers = {
  POINT_100: 0.1,
  POINT_10: 1,
  POINT_10_DECIMAL: 1,
  POINT_5: 2,
  POINT_3: 3.3,
}

function parseUpdateTime(updated) {
  if (!updated) return "";
  const time = +normalizedNow() - +updated;
  
  if (time < times.MINUTES) {
    return ` - *${Math.round(time/times.SECONDS)}s ago*`
  } else if (time < times.HOURS) {
    return ` - *${Math.round(time/times.MINUTES)}min ago*`
  } else if (time < times.DAYS) {
    return ` - *${Math.round(time/times.HOURS)}h ago*`
  } else if (time < times.YEARS) {
    return ` - *${Math.round(time/times.DAYS)}d ago*`;
  } else {
    return ` - *${Math.round(time/times.YEARS)}y ago*`;
  }
}

function parseTimeLeft(time) {
  if (!time) return "";
  if (time < times.HOURS) {
    return `${Math.round(time/times.MINUTES)}min`;
  } else if (time < times.DAYS) {
    return `${Math.round(time/times.HOURS)}h`;
  } else if (time < times.YEARS) {
    return `${Math.round(time/times.DAYS)}d`;
  } else {
    return `${Math.round(time/times.YEARS)}y`;
  }
}

function normalizedNow() {
  return parseInt((+Date.now()).toString().substring(0, 10))
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function makeAnilistAnimeUrl(id) {
  return `https://anilist.co/anime/${id}`
}

function secondsToTime(secs) {
  const minutes = (secs - (secs %= 60)) / 60
  const seconds = 9 < secs ? ":" : ":0";
  return minutes + seconds + Math.round(secs)
}

// Not used?
function getGuildIdOrUserId(message) {
  let guild = message.author;
  if (message.guild && message.guild.id) {
    guild = message.guild.id
  }    
  return guild;
}

module.exports.times = times;
module.exports.scoreFormatMultipliers = scoreFormatMultipliers;
module.exports.parseUpdateTime = parseUpdateTime;
module.exports.parseTimeLeft = parseTimeLeft;
module.exports.normalizedNow = normalizedNow;
module.exports.isEmpty = isEmpty;
module.exports.makeAnilistAnimeUrl = makeAnilistAnimeUrl;
module.exports.secondsToTime = secondsToTime;
module.exports.getGuildIdOrUserId = getGuildIdOrUserId;
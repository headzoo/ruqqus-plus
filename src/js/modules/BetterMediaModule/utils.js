const imgurRegex = new RegExp('^https:\\/\\/(i\\.)?imgur\\.com\\/(a\\/|gallery\\/)?([^\\/.]+)(\\.[a-zA-Z4]{3,4})?$');

/**
 * @param {URL} mediaUrl
 * @returns {{ext: string, isVideo: boolean, id: string, type: string}|null}
 */
export const getImgurInfo = (mediaUrl) => {
  const matches = mediaUrl.toString().match(imgurRegex);
  if (!matches) {
    return null;
  }

  return {
    id:      matches[3],
    type:    (matches[2] || '').replace('/', ''),
    ext:     matches[4],
    isVideo: ['.mp4', '.gifv'].indexOf(matches[4]) !== -1
  };
};

/**
 *
 * @param {{ext: string, isVideo: boolean, id: string, type: string}|null} info
 * @returns {Promise<string>}
 */
export const fetchImgurURL = (info) => {
  let src;
  if (info.type === 'a') {
    src = `https://api.imgur.com/3/album/${info.id}.json`;
  } else if (info.type === 'gallery') {
    src = `https://api.imgur.com/3/gallery/${info.id}.json`;
  } else {
    src = `https://api.imgur.com/3/image/${info.id}.json`;
  }

  return fetch(src, {
    headers: {
      'Authorization': 'Client-ID 92b389723993e50'
    }
  })
    .then((resp) => resp.json())
    .then((json) => {
      if (!json.success) {
        return '';
      }

      let { link } = json.data;
      if (json.data.images) {
        link = json.data.images[0].link;
      }

      return link;
    });
};

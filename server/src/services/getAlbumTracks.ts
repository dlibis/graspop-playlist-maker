import axios from "axios";

export const getAlbumTracks = async (album_id, access_token, offset = 0) => {
  const {
    data: { items, total, limit },
  } = await axios.get(
    `https://api.spotify.com/v1/albums/${album_id}/tracks?limit=50&market=IL&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return { items, total, limit };
};

import axios from "axios";

export const getArtistsAlbums = async (artist_id, access_token) => {
  const {
    data: { items },
  } = await axios.get(
    `https://api.spotify.com/v1/artists/${artist_id}/albums?include_groups=album&market=IL&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return items;
};

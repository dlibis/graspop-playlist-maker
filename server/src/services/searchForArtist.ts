import axios from "axios";

export const searchForArtist = async (artist: string, access_token: string) => {
  const {
    data: { artists: artist_data },
  } = await axios.get(
    `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  console.log("found artist id");
  return artist_data.items[0].id;
};

import { default as axios } from "axios";
import axiosRateLimit from "axios-rate-limit";
const rateLimitedAxios = axiosRateLimit(axios.create(), {
  maxRequests: 2, // Max number of requests in a given time period
  perMilliseconds: 1000, // Time period in milliseconds
});
export const addArtistToPlaylist = async (
  artist,
  access_token,
  graspop_playlist_id
) => {
  try {
    console.log(`start adding ${artist}`);
    const {
      data: { artists: artist_data },
    } = await axios.get(
      `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    console.log("found artist id");
    const artist_id = artist_data.items[0].id;
    const {
      data: { tracks: track_data },
    } = await axios.get(
      `https://api.spotify.com/v1/artists/${artist_id}/top-tracks?market=ES`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    console.log("found artist top 10");
    const uri_tracks = track_data.map(({ uri }) => uri);
    console.log("start adding tracks");
    await axios.post(
      `https://api.spotify.com/v1/playlists/${graspop_playlist_id}/tracks`,
      { uris: uri_tracks },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    console.log(`${artist} added!`);
  } catch (error) {
    throw new Error(error);
    // handle error here
  }
};

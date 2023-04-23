import { default as axios } from "axios";
import axiosRateLimit from "axios-rate-limit";
import { searchForArtist } from "./searchForArtist";
const rateLimitedAxios = axiosRateLimit(axios.create(), {
  maxRequests: 2, // Max number of requests in a given time period
  perMilliseconds: 1000, // Time period in milliseconds
});
export const addArtistToPlaylist = async (
  artist: string,
  access_token: string,
  graspop_playlist_id: string
) => {
  try {
    console.log(`start adding ${artist}`);
    const artist_id = await searchForArtist(artist, access_token);
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

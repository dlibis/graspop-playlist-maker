import axios from "axios";

export const addTracksToPlaylist = async (
  uri_tracks: string[],
  access_token: string,
  playlist_id = "3ure8n67UWKqQ31S1jUI33"
) => {
  try {
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
      { uris: uri_tracks },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};

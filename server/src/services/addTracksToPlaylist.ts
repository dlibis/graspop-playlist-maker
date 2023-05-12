import axiosReq from '@/utils/axiosReq';
import axios from 'axios';

export const addTracksToPlaylist = async (
  uri_tracks: string[],
  playlist_id = '3ure8n67UWKqQ31S1jUI33',
  sid,
) => {
  try {
    await axiosReq(sid).post(
      `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
      { uris: uri_tracks },
    );
  } catch (error) {
    console.error(error);
  }
};

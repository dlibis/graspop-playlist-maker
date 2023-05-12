import { default as axios } from 'axios';
import axiosRateLimit from 'axios-rate-limit';
import { searchForArtist } from './searchForArtist';
import axiosReq from '@/utils/axiosReq';

export const addArtistToPlaylist = async (
  artist: string,
  graspop_playlist_id: string,
  sid,
) => {
  try {
    console.log(`start adding ${artist}`);
    const artist_id = await searchForArtist(artist, sid);
    const {
      data: { tracks: track_data },
    } = await axiosReq(sid).get(
      `https://api.spotify.com/v1/artists/${artist_id}/top-tracks?market=ES`,
    );
    console.log('found artist top 10');
    const uri_tracks = track_data.map(({ uri }) => uri);
    console.log('start adding tracks');
    await axiosReq(sid).post(
      `https://api.spotify.com/v1/playlists/${graspop_playlist_id}/tracks`,
      { uris: uri_tracks },
    );
    console.log(`${artist} added!`);
  } catch (error) {
    throw new Error(error);
    // handle error here
  }
};

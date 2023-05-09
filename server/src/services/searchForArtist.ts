import axiosReq from '@/utils/axiosReq';
import axios from 'axios';

export const searchForArtist = async (artist: string) => {
  const {
    data: { artists: artist_data },
  } = await axiosReq.get(
    `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=10`,
  );
  console.log('found artist id');
  return artist_data.items[0].id;
};

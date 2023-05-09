import axiosReq from '@/utils/axiosReq';
import axios from 'axios';

export const getArtistsAlbums = async (artist_id) => {
  const {
    data: { items },
  } = await axiosReq.get(
    `https://api.spotify.com/v1/artists/${artist_id}/albums?include_groups=album&market=IL&limit=50`,
  );
  return items;
};

import axiosReq from '@/utils/axiosReq';
import axios from 'axios';

export const getAlbumTracks = async (album_id, sid, offset = 0) => {
  const {
    data: { items, total, limit },
  } = await axiosReq(sid).get(
    `https://api.spotify.com/v1/albums/${album_id}/tracks?limit=50&market=IL&offset=${offset}`,
  );
  return { items, total, limit };
};

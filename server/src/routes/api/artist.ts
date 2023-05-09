import { last_fm_api } from '@/constants';
import axiosReq from '@/utils/axiosReq';
import { getValueByKey } from '@/utils/utils';

import axios from 'axios';
import express, { RequestHandler } from 'express';

const router = express.Router();

router.get('/:id', (async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await axios.get(
      `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${id}&api_key=${last_fm_api}&format=json&limit=20`,
    );
    const similarArtistsArr = getValueByKey(['similarartists', 'artist'], data);
    res.status(200).json(similarArtistsArr);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}) as RequestHandler);

router.get('/spotify/:id', (async (req, res) => {
  try {
    const host = req.get('host');
    const referer = `${req.protocol}://${host}`;
    console.log(referer);
    const { id } = req.params;
    const query = encodeURIComponent(
      `https://api.spotify.com/v1/search?q=${id}&type=artist&market=US&limit=1`,
    );
    const { data } = await axios.get(`${referer}/spotify/data?query=${query}`);
    const artistData = getValueByKey(['artists', 'items'], data)[0] || {};
    res.status(200).json({
      genres: artistData.genres,
      href: artistData.external_urls.spotify,
      images: artistData.images,
    });
  } catch (error: any) {
    res.status(500).json(error.message);
  }
}) as RequestHandler);
export default router;

import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { lastfmApi } from '@/constants';
import { getValueByKey } from '@/utils/utils';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { data } = await axios.get(
      `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${id}&api_key=${lastfmApi}&format=json&limit=20`,
    );
    const similarArtistsArr = getValueByKey(['similarartists', 'artist'], data);
    res.status(200).json(similarArtistsArr);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { apiUrl } from '@/constants';
import { getValueByKey } from '@/utils/utils';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const query = encodeURIComponent(
      `https://api.spotify.com/v1/search?q=${id}&type=artist&market=US&limit=1`,
    );
    const { data } = await axios.get(`${apiUrl}/data?query=${query}`);
    const artistData = getValueByKey(['artists', 'items'], data)[0] || {};
    res.status(200).json({
      genres: artistData.genres,
      href: artistData.external_urls.spotify,
      images: artistData.images,
    });
  } catch (error: any) {
    res.status(500).json(error.message);
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import { redirect_uri, scope, spotify_client_id } from '@/constants';

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) =>
  res.redirect(
    `https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scope}`,
  );
export default handler;

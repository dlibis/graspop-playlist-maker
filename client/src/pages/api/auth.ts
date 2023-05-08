import { NextApiRequest, NextApiResponse } from 'next';

import { redirect_uri, scope, spotify_client_id } from '@/constants';

const handler = async (req: NextApiRequest, res: NextApiResponse<void>) =>
  res.redirect(
    `https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${
      req.headers['x-forwarded-proto'] || 'http'
    }://${req.headers.host}/account&scope=${scope}`,
  );
export default handler;

import { NextApiRequest, NextApiResponse } from 'next';

import { scope, spotifyClientId } from '@/constants';

const handler = async (req: NextApiRequest, res: NextApiResponse<void>) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  res.redirect(
    `https://accounts.spotify.com/authorize?client_id=${spotifyClientId}&response_type=code&redirect_uri=${
      req.headers['x-forwarded-proto'] || 'http'
    }://${req.headers.host}/spotify/account&scope=${scope}`,
  );
export default handler;

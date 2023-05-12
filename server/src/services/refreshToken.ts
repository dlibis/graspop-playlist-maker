import axios from 'axios';
import { encodedAuth } from '@/constants';
import redisClient from '@/utils/redis';

export const refreshToken = async (refresh_token, userId: string) => {
  const {
    data: { access_token, expires_in },
  } = await axios.post(
    'https://accounts.spotify.com/api/token',
    { grant_type: 'refresh_token', refresh_token: refresh_token },
    {
      headers: {
        Authorization: `Basic ${encodedAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  if (await redisClient.EXISTS(userId)) {
    redisClient.HSET(userId, 'refresh_token', access_token);
  }
  return access_token;
};

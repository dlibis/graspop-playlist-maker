import { refreshToken } from '@/services/refreshToken';
import redisClient from '@/utils/redis';
import axios from 'axios';

export const checkToken = async (userId) => {
  console.log('in check token');
  console.log({ userId });
  const tokenData = await redisClient.v4.GET(userId);
  console.log({ tokenData });
  let { access_token, refresh_token } = JSON.parse(tokenData);

  if (!access_token) {
    access_token = await refreshToken(refresh_token, userId);
  }
  return access_token;
};

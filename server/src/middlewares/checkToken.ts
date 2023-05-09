import { refreshToken } from '@/services/refreshToken';
import redisClient from '@/utils/redis';
import { RedisClientType } from 'redis';

export const checkToken = async () => {
  let access_token = await redisClient.v4.GET('access_token');
  if (!access_token) {
    const refresh_token = await redisClient.v4.GET('refresh_token');
    access_token = await refreshToken(refresh_token);
  }
  return access_token;
};

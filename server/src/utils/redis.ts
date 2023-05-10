import { redis_host, redis_port } from '@/constants';
import { createClient } from 'redis';

const redisClient = createClient({
  url: `redis://${redis_host}:${redis_port}`,
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));

export default redisClient;

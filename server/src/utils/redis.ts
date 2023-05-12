import { redis_host, redis_port } from '@/constants';
import { createClient } from 'redis';

const redisClient = createClient({
  legacyMode: true,
  socket: {
    port: redis_port,
    host: redis_host,
  },
});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () =>
  console.log(
    '%c Successful to connect with redis',
    'color:red; font-size:30px; font-weight: bold; -webkit-text-stroke: 1px black;',
  ),
);

export default redisClient;

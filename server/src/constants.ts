import dotenv from 'dotenv';
import { encodeBase64 } from './utils/utils';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.development' });
}

console.log({
  env: process.env.NODE_ENV,
  rport: process.env.REDISPORT,
  host: process.env.REDISHOST,
});

export const isDev = process.env.NODE_ENV !== 'production';
export const port = process.env.PORT! || 5000;
export const graspopLineup = process.env.GRASPOP_LINEUP!;
export const scope = process.env.SCOPE!;
export const redirect_uri = process.env.REDIRECT_URI!;
export const spotify_client_id = process.env.SPOTIFY_CLIENT_ID!;
export const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
export const redis_port = +process.env.REDISPORT! || 6379;
export const redis_host = process.env.REDISHOST! || '127.0.0.1';
export const encodedAuth = encodeBase64(
  spotify_client_id,
  spotify_client_secret,
);
export const client_url = process.env.CLIENT_URL!;
export const last_fm_api = process.env.LAST_FM_API!;

import dotenv from 'dotenv';
import { encodeBase64 } from './utils';

dotenv.config();

export const port = process.env.PORT!;
export const graspopLineup = process.env.GRASPOP_LINEUP!;
export const scope = process.env.SCOPE!;
export const redirect_uri = process.env.REDIRECT_URI!;
export const spotify_client_id = process.env.SPOTIFY_CLIENT_ID!;
export const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
export const redis_port = process.env.REDIS_PORT!;
export const encodedAuth = encodeBase64(
  spotify_client_id,
  spotify_client_secret,
);
export const client_url = process.env.CLIENT_URL!;
export const last_fm_api = process.env.LAST_FM_API!;

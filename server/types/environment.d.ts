export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      REDIS_PORT: number;
      GRASPOP_LINEUP: string;
      SPOTIFY_CLIENT_ID: string;
      SPOTIFY_CLIENT_SECRET: string;
      SCOPE: string;
      LAST_FM_API: string;
      REDIRECT_URI: string;
    }
  }
}

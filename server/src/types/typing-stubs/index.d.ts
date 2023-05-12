import session from 'express-session';
import { SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    refresh_token: string;
    access_token: string;
  }
}

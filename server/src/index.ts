import express, { Request, Response } from 'express';
import { isDev, port, redis_host, redis_port } from '@/constants';

import cors from 'cors';
import path from 'path';
import api from '@/routes/api';
import spotify from '@/routes/api/spotify';
import artistRoutes from '@/routes/api/artist';
import session, { Session } from 'express-session';
import cookieParser from 'cookie-parser';
import RedisStore from 'connect-redis';
import connectRedis from 'connect-redis';

import next from '../../client/node_modules/next';
import redisClient from '@/utils/redis';

const clientPath = path.dirname(path.dirname(__dirname));

const app = next({
  dev: isDev,
  dir: path.join(clientPath, 'client'),
  isNextDevCommand: false,
});
const handle = app.getRequestHandler();
(async () => {
  try {
    await app.prepare();

    const server = express();
    const redisStore = new RedisStore({
      disableTTL: true,
      client: redisClient,
      prefix: 's:',
    });

    server.use(cors());
    server.use(cookieParser());
    await redisClient.connect();
    server.use(
      session({
        store: redisStore,
        resave: false,
        saveUninitialized: false,
        secret: 'keyboard cat',
        cookie: { maxAge: 86400000, httpOnly: false, secure: false },
      }),
    );

    server.get('/', async (req: Request, res: Response) => {
      await app.render(req, res, '/');
    });

    server.get('/notRegistered', async (req: Request, res: Response) => {
      await app.render(req, res, '/notRegistered');
    });

    server.get('/error', async (req: Request, res: Response) => {
      await app.render(req, res, '/error');
    });

    server.use('/api', api);
    server.use('/spotify', spotify);
    server.use('/artist', artistRoutes);
    server.get('*', async (req, res) => {
      await handle(req, res);
    });

    server.listen(port, () => {
      console.log(
        `%c ⚡ [server]: Server is running at http://localhost:${port} in ${process.env.NODE_ENV}`,
        'color:red; font-size:30px; font-weight: bold; -webkit-text-stroke: 1px black;',
      );
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

// app
//   .prepare()
//   .then(() => {
//     const redisStore = new RedisStore({
//       client: redisClient,
//       prefix: 'myapp:',
//     });
//     server.use(cors());
//     server.use(cookieParser());
//     server.use(
//       session({
//         //store: redisStore,
//         resave: false,
//         saveUninitialized: true,
//         secret: 'keyboard cat',
//       }),
//     );

//     server.get('/', (req: Request, res: Response) => {
//       // @ts-ignore
//       req.session.foo = 'some text here';
//       console.log(req.session);
//       return app.render(req, res, '/');
//     });

//     server.use('/api', api);
//     server.use('/spotify', spotify);
//     server.use('/artist', artistRoutes);
//     server.get('*', async (req, res) => {
//       await handle(req, res);
//     });

//     redisClient.connect().then(() => {
//       server.listen(port, () => {
//         console.log(
//           `⚡ [server]: Server is running at http://localhost:${port} in ${process.env.NODE_ENV}`,
//         );
//       });
//     });
//   })
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   });

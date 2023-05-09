import express from 'express';
import { isDev, port } from '@/constants';

import cors from 'cors';
import path from 'path';
import api from '@/routes/api';
import spotify from '@/routes/api/spotify';
import artistRoutes from '@/routes/api/artist';

import next from '../../client/node_modules/next';

import { loadEnvConfig } from '../../client/node_modules/@next/env';
import redisClient from '@/utils/redis';
// loadEnvConfig('../../client', isDev);
console.log(isDev);

const clientPath = path.dirname(path.dirname(__dirname));

const app = next({
  dev: true,
  dir: path.join(clientPath, 'client'),
  isNextDevCommand: false,
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();
    server.use(cors());
    server.get('/', (req, res) => {
      return app.render(req, res, '/');
    });

    server.use('/api', api);
    server.use('/spotify', spotify);
    server.use('/artist', artistRoutes);
    server.get('*', async (req, res) => {
      await handle(req, res);
    });

    redisClient.connect().then(() => {
      server.listen(port, () => {
        console.log(
          `⚡ [server]: Server is running at http://localhost:${port}`,
        );
      });
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

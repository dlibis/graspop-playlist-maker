import express, { Express, Request, Response } from 'express';
import {
  client_url,
  encodedAuth,
  last_fm_api,
  port,
  redirect_uri,
  redis_port,
  scope,
  spotify_client_id,
} from '@/constants';

import axios from 'axios';
import { createClient } from 'redis';
import { addArtistToPlaylist } from '@/services/addArtistToPlaylist';
import { searchForArtist } from '@/services/searchForArtist';
import { getArtistsAlbums } from '@/services/getArtistsAlbums';
import { refreshToken } from '@/services/refreshToken';
import { fetchBands } from '@/services/listOfBandsGetter';
import { getAlbumTracks } from './services/getAlbumTracks';
import { addTracksToPlaylist } from './services/addTracksToPlaylist';
import cors from 'cors';
import corsAnywhere from 'cors-anywhere';
import path from 'path';
import { axiosRequest, getValueByKey } from '@/utils';
import next from '@client/node_modules/next';

const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, dir: path.join(__dirname, '../../client') });
const handle = app.getRequestHandler();

(async () => {
  try {
    await app.prepare();
    const server = express();
    const client = createClient({
      legacyMode: true,
      socket: {
        port: 6379,
        host: process.env.REDIS_HOST!,
      },
    });
    client.connect();
    server.use(cors());

    const attachAuthorization = async (req, res, next) => {
      let access_token = await client.v4.GET('access_token');
      if (!access_token) {
        const refresh_token = await client.v4.GET('refresh_token');
        access_token = await refreshToken(client, refresh_token);
      }
      const url = req.url;
      if (url === '/secure') {
        req.authorization = 'Bearer <insert token here>';
      }
      next();
    };

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      accept: 'text/html',
    };
    // proxy server
    let proxy = corsAnywhere.createServer({
      originWhitelist: [], // Allow all origins
      //requireHeaders: [], // Do not require any headers.
      removeHeaders: [], // Do not remove any headers.
      credentials: 'include',
      setHeaders: headers, // set the headers in the request
    });

    const backendInstance = axios.create({
      baseURL: 'http://localhost:5000',
      timeout: 1000,
    });

    /* Attach our cors proxy to the existing API on the /proxy endpoint. */
    server.get('/proxy/:proxyUrl*', (req, res) => {
      req.url = req.url.replace('/proxy/', '/'); // Strip '/proxy' from the front of the URL, else the proxy won't work.
      proxy.emit('request', req, res);
    });

    server.get('/bands', async (req: Request, res: Response) => {
      const bands = await fetchBands();

      res.send(JSON.stringify(bands));
    });
    // server.get('/', (req, res) => {
    //   res.sendFile(path.join(__dirname, '../../client/build/index.html'));
    // });

    server.get('/artist/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { data } = await axios.get(
          `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${id}&api_key=${last_fm_api}&format=json&limit=20`,
        );
        const similarArtistsArr = getValueByKey(
          ['similarartists', 'artist'],
          data,
        );
        res.status(200).json(similarArtistsArr);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    server.get('/artist/spotify/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const query = encodeURIComponent(
          `https://api.spotify.com/v1/search?q=${id}&type=artist&market=US&limit=1`,
        );
        const { data } = await backendInstance.get(`/data?query=${query}`);
        console.log(data);
        const artistData = getValueByKey(['artists', 'items'], data)[0] || {};
        res.status(200).json({
          genres: artistData.genres,
          href: artistData.external_urls.spotify,
          images: artistData.images,
        });
      } catch (error: any) {
        res.status(500).json(error.message);
      }
    });

    server.get('/auth', (req, res) => {
      res.redirect(
        `https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scope}`,
      );
    });

    server.get('/get-bands', async (req, res) => {
      try {
        let access_token = await client.v4.GET('access_token');
        if (!access_token) {
          access_token = await axios.get('/auth');
        }
        const {
          data: { items },
        } = await axios.get('https://api.spotify.com/v1/me/playlists', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        const { id: graspop_playlist_id } = items.find(
          (item) => item.name === 'test1',
        );

        const bands = await fetchBands();
        if (!bands) return;
        const bandsArr = Object.keys(bands);
        for (const band of bandsArr) {
          await addArtistToPlaylist(band, access_token!, graspop_playlist_id);
        }
      } catch (err) {
        console.log(err);
      }

      res.send('ok');
    });

    //get data from spotify

    server.get('/data', async (req, res) => {
      try {
        let query = <string>req.query.query;
        let access_token = await client.v4.GET('access_token');
        if (!access_token) {
          const refresh_token = await client.v4.GET('refresh_token');
          access_token = await refreshToken(client, refresh_token);
        }
        const { data } = await axios.get(query, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        res.send(data);
      } catch (e) {
        res.status(403).json({});
      }
    });

    server.get('/get-artist', async (req, res) => {
      const artist = <string>req.query.artist;
      const playlist_id = <string | undefined>req.query.id;
      const full = <'true' | 'false'>req.query.full;
      let access_token = await client.v4.GET('access_token');
      if (!access_token) {
        const refresh_token = await client.v4.GET('refresh_token');
        access_token = await refreshToken(client, refresh_token);
      }
      const artist_id = await searchForArtist(artist!, access_token!);
      if (full === 'false') {
        const { tracks: track_data } = await axiosRequest(
          `https://api.spotify.com/v1/artists/${artist_id}/top-tracks?market=IL`,
          access_token,
        );
        const tracks_uri = track_data.map(({ uri }) => uri);
        await addTracksToPlaylist(tracks_uri, access_token!, playlist_id);
      } else {
        const albums = await getArtistsAlbums(artist_id, access_token);
        for (const [i, album] of albums.entries()) {
          console.log(
            `adding tracks from ${album.name} index: ${i + 1}/${albums.length}`,
          );
          const { total, limit } = await getAlbumTracks(album.id, access_token);
          // calculate needed iterations
          const iter = Math.ceil(total / limit);
          for (let i = 0; i < iter; i++) {
            const { items: tracks } = await getAlbumTracks(
              album.id,
              access_token,
              50 * i,
            );
            const tracks_uri: string[] = tracks.map(({ uri }) => uri);
            await addTracksToPlaylist(tracks_uri, access_token!, playlist_id);
          }
        }
      }
      res.send('done');
    });

    server.get('/create-playlist', async (req, res) => {
      const name = <string>req.query.name;
      let access_token = await client.v4.GET('access_token');
      if (!access_token) {
        const refresh_token = await client.v4.GET('refresh_token');
        access_token = await refreshToken(client, refresh_token);
      }
      const {
        data: { id: user_id },
      } = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      await axios.post(
        `https://api.spotify.com/v1/users/${user_id}/playlists`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      res.send('playlist created');
    });

    server.get('/account', async (req, res) => {
      try {
        const {
          data: { access_token, refresh_token },
        } = await axios.post(
          'https://accounts.spotify.com/api/token',
          undefined,
          {
            params: {
              grant_type: 'authorization_code',
              code: req.query.code,
              redirect_uri: redirect_uri,
            },
            headers: {
              Authorization: `Basic ${encodedAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );
        await client.setEx('access_token', 3600, access_token);
        await client.setEx('refresh_token', 3600 * 12, refresh_token);
        res.redirect('/'); // Redirect to a success page
      } catch (error) {
        console.error(error);
        res.redirect(`/error`); // Redirect to an error page
      }
    });

    server.get('*', (req, res) => {
      return handle(req, res);
    });
    server.listen(port, () => {
      console.log(`⚡ [server]: Server is running at http://localhost:${port}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

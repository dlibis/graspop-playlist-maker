import { encodedAuth, redirect_uri } from '@/constants';
import { addTracksToPlaylist } from '@/services/addTracksToPlaylist';
import { getAlbumTracks } from '@/services/getAlbumTracks';
import { getArtistsAlbums } from '@/services/getArtistsAlbums';
import { refreshToken } from '@/services/refreshToken';
import { searchForArtist } from '@/services/searchForArtist';
import axiosReq from '@/utils/axiosReq';
import redisClient from '@/utils/redis';
import axios from 'axios';
import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/data', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const { data } = await axiosReq(req.cookies['connect.sid']).get(query);

    res.send(data);
  } catch (e) {
    res.status(403).json({});
  }
});

router.get('/create-playlist', async (req, res) => {
  const name = req.query.name as string;
  const {
    data: { id: user_id },
  } = await axiosReq(req.cookies['connect.sid']).get(
    'https://api.spotify.com/v1/me',
  );
  await axiosReq(req.cookies['connect.sid']).post(
    `https://api.spotify.com/v1/users/${user_id}/playlists`,
    {
      name,
    },
  );
  res.send('playlist created');
});

router.get('/account', async (req, res) => {
  try {
    const {
      data: { access_token, refresh_token },
    } = await axios.post('https://accounts.spotify.com/api/token', undefined, {
      params: {
        grant_type: 'authorization_code',
        code: req.query.code,
        redirect_uri: `${redirect_uri}`,
      },
      headers: {
        Authorization: `Basic ${encodedAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const {
      data: { id },
    } = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    req.session.userId = id;
    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;
    res.redirect('/'); // Redirect to a success page
  } catch (error) {
    if (error.response.status === 403) res.redirect('/notRegistered');
    console.error(error);
    res.redirect('/error'); // Redirect to an error page
  }
});

router.get('/get-artist', async (req, res) => {
  const artist = req.query.artist as string;
  const playlist_id = req.query.id as string | undefined;
  const full = req.query.full as 'true' | 'false';
  const artist_id = await searchForArtist(artist, req.cookies['connect.sid']);
  if (full === 'false') {
    const { data } = await axiosReq(req.cookies['connect.sid']).get(
      `https://api.spotify.com/v1/artists/${artist_id}/top-tracks?market=IL`,
    );
    //ts-ignore
    const track_data = data.tracks;
    const tracks_uri = track_data.map(({ uri }) => uri);
    await addTracksToPlaylist(
      tracks_uri,
      playlist_id,
      req.cookies['connect.sid'],
    );
  } else {
    const albums = await getArtistsAlbums(
      artist_id,
      req.cookies['connect.sid'],
    );
    for (const [i, album] of albums.entries()) {
      console.log(
        `adding tracks from ${album.name} index: ${i + 1}/${albums.length}`,
      );
      const { total, limit } = await getAlbumTracks(
        album.id,
        req.cookies['connect.sid'],
      );
      // calculate needed iterations
      const iter = Math.ceil(total / limit);
      for (let i = 0; i < iter; i++) {
        const { items: tracks } = await getAlbumTracks(
          album.id,
          req.cookies['connect.sid'],
          50 * i,
        );
        const tracks_uri: string[] = tracks.map(({ uri }) => uri);
        await addTracksToPlaylist(
          tracks_uri,
          playlist_id,
          req.cookies['connect.sid'],
        );
      }
    }
  }
  res.send('done');
});
export default router;

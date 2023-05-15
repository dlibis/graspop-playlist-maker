import { redirect_uri, spotify_client_id, scope } from '@/constants';
import redisClient from '@/utils/redis';
import express from 'express';

const router = express.Router();

router.get('/auth', (req, res) => {
  res.redirect(
    `https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scope}`,
  );
});

router.get('/getCookie', (req, res) => {
  //@ts-ignore
  res.status(200).json(req.session.username);
});

router.get('/logout', (req, res) => {
  console.log('user logging out...');
  if (req.cookies['connect.sid']) {
    const [id] = req.cookies['connect.sid'].split('.');
    redisClient.v4.DEL(id);
  }
  res.status(200).send('done');
});

export default router;

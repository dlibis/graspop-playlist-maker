import { redirect_uri, spotify_client_id, scope } from '@/constants';
import express from 'express';

const router = express.Router();

router.get('/auth', (req, res) => {
  res.redirect(
    `https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scope}`,
  );
});

export default router;

import express from 'express';
import proxy from '../utils/proxy';

const router = express.Router();

router.get('/:proxyUrl*', (req, res) => {
  req.url = req.url.replace('/proxy/', '/'); // Strip '/proxy' from the front of the URL, else the proxy won't work.
  proxy.emit('request', req, res);
});
export default router;

import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'node-html-parser';

import { apiUrl } from '@/constants';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    const url = `${apiUrl}/proxy/https://www.last.fm/music/${id}/+images`;
    const { data: html } = await axios.get(url, {
      responseType: 'text',
      headers: { accept: 'text/html' },
    });
    // Step 2: Parse the HTML
    const doc = parse(html);
    // Step 3: Select the container element that holds the images
    const img = doc.querySelector('.image-list-item > img')?.getAttribute('src');

    // Step 5: Store the image URLs or use them as needed
    res.status(200).json(img);
  } catch (error: any) {
    res.status(500).json(error.message);
  }
}

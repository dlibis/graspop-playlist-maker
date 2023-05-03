import { lastfm_api } from "@/constants";
import { getValueByKey } from "@/utils/utils";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

const cors = Cors({
  methods: ["GET", "HEAD"],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { data } = await axios.get(
      `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${id}&api_key=${lastfm_api}&format=json&limit=20`
    );
    const similarArtistsArr = getValueByKey(["similarartists", "artist"], data);
    res.status(200).json(similarArtistsArr);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

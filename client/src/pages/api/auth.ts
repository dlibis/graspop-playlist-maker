import { redirect_uri, scope, spotify_client_id } from "@/constants";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  //await fetch(`${process.env.API_URL}/auth`);
  //   const resp = await resolved.json();
  return res.redirect(
    `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI}&scope=${process.env.SCOPE}`
  );
};
export default handler;

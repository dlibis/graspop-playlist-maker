// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
  const queryString = Object.keys(req.query)
    .map((key) => `${key}=${req.query[key]}`)
    .join("&");
  const resp = await fetch(`${process.env.API_URL}/user?${queryString}`);
  const { data } = await resp.json();
  res.status(200).json(data);
};
export default handler;

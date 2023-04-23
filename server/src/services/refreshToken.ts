import axios from "axios";
import { encodedAuth } from "@/constants";
import { createClient } from "redis";

export const refreshToken = async (
  client: ReturnType<typeof createClient>,
  refresh_token
) => {
  const {
    data: { access_token, expires_in },
  } = await axios.post(
    "https://accounts.spotify.com/api/token",
    { grant_type: "refresh_token", refresh_token: refresh_token },
    {
      headers: {
        Authorization: `Basic ${encodedAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  //const expired_time = expires_in + Date.now();
  await client.setEx("access_token", 3600, access_token);
  return access_token;
};

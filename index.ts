import express, { Express, Request, Response } from "express";
import {
  encodedAuth,
  port,
  redirect_uri,
  redis_port,
  scope,
  spotify_client_id,
} from "./constants";
import { fetchBands } from "./listOfBandsGetter";
import { default as axios } from "axios";
import { createClient } from "redis";
import { addArtistToPlaylist } from "./addArtistToPlaylist";

const app: Express = express();
const client = createClient();
client.connect();

app.get("/bands", async (req: Request, res: Response) => {
  const bands = await fetchBands();

  res.send(JSON.stringify(bands));
});
app.get("/", (req, res) => {
  res.send(
    `<a href='https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scope}'>Sign in</a>`
  );
});

app.get("/get-bands", async (req, res) => {
  const access_token = await client.get("access_token");
  const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const { items } = data;
  const { id: graspop_playlist_id } = items.find(
    (item) => item.name === "test1"
  );
  const bands = await fetchBands();
  const bandsArr = Object.keys(bands);

  try {
    for (const band of bandsArr) {
      await addArtistToPlaylist(band, access_token, graspop_playlist_id);
    }
  } catch (err) {
    console.log(err);
  }

  // Object.keys(bands)
  //   .slice(2, 4)
  //   .forEach((band) => {
  //     (async () =>
  //       await addArtistToPlaylist(band, access_token, graspop_playlist_id))();
  //   });

  res.send("ok");
});

app.get("/account", async (req, res) => {
  try {
    const { data } = await axios.post(
      "https://accounts.spotify.com/api/token",
      undefined,
      {
        params: {
          grant_type: "authorization_code",
          code: req.query.code,
          redirect_uri: redirect_uri,
        },
        headers: {
          Authorization: `Basic ${encodedAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    await client.setEx("access_token", 3600, data?.access_token);
    res.redirect("/"); // Redirect to a success page
  } catch (error) {
    console.error(error);
    res.redirect("/error"); // Redirect to an error page
  }
});
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

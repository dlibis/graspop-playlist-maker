import express, { Express, Request, Response } from "express";
import {
  client_url,
  encodedAuth,
  port,
  redirect_uri,
  scope,
  spotify_client_id,
} from "@/constants";

import axios from "axios";
import { createClient } from "redis";
import { addArtistToPlaylist } from "@/services/addArtistToPlaylist";
import { searchForArtist } from "@/services/searchForArtist";
import { getArtistsAlbums } from "@/services/getArtistsAlbums";
import { refreshToken } from "@/services/refreshToken";
import { fetchBands } from "@/services/listOfBandsGetter";
import { getAlbumTracks } from "./services/getAlbumTracks";
import { addTracksToPlaylist } from "./services/addTracksToPlaylist";
import cors from "cors";

const app: Express = express();
const client = createClient();
client.connect();
app.use(cors());

app.get("/bands", async (req: Request, res: Response) => {
  const bands = await fetchBands();

  res.send(JSON.stringify(bands));
});
// app.get("/", (req, res) => {
//   res.send(
//     `<a href='https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scope}'>Sign in</a>`
//   );
// });

// app.get("/auth", (req, res) => {
//   res.redirect(
//     `https://accounts.spotify.com/authorize?client_id=${spotify_client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=${scope}`
//   );
// });

app.get("/get-bands", async (req, res) => {
  try {
    let access_token = await client.get("access_token");
    if (!access_token) {
      access_token = await axios.get("/auth");
    }
    const {
      data: { items },
    } = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id: graspop_playlist_id } = items.find(
      (item) => item.name === "test1"
    );

    const bands = await fetchBands();
    if (!bands) return;
    const bandsArr = Object.keys(bands);
    for (const band of bandsArr) {
      await addArtistToPlaylist(band, access_token!, graspop_playlist_id);
    }
  } catch (err) {
    console.log(err);
  }

  res.send("ok");
});

app.get("/user", async (req, res) => {
  const type = <string>req.query.type;
  let access_token = await client.get("access_token");
  if (!access_token) {
    const refresh_token = await client.get("refresh_token");
    access_token = await refreshToken(client, refresh_token);
  }
  const path = type
    ? `https://api.spotify.com/v1/me/${type}`
    : `https://api.spotify.com/v1/me`;
  const { data } = await axios.get(path, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  res.send({ data });
});

app.get("/get-artist", async (req, res) => {
  const artist = <string>req.query.artist;
  const playlist_id = <string | undefined>req.query.id;
  let access_token = await client.get("access_token");
  if (!access_token) {
    const refresh_token = await client.get("refresh_token");
    access_token = await refreshToken(client, refresh_token);
  }
  const artist_id = await searchForArtist(artist!, access_token!);
  const albums = await getArtistsAlbums(artist_id, access_token);
  for (const [i, album] of albums.entries()) {
    console.log(
      `adding tracks from ${album.name} index: ${i + 1}/${albums.length}`
    );
    const { total, limit } = await getAlbumTracks(album.id, access_token);
    // calculate needed iterations
    const iter = Math.ceil(total / limit);
    for (let i = 0; i < iter; i++) {
      const { items: tracks } = await getAlbumTracks(
        album.id,
        access_token,
        50 * i
      );
      const tracks_uri: string[] = tracks.map(({ uri }) => uri);
      await addTracksToPlaylist(tracks_uri, access_token!, playlist_id);
    }
  }
  res.send("done");
});

app.get("/create-playlist", async (req, res) => {
  console.log("create play");
  const name = <string>req.query.name;
  let access_token = await client.get("access_token");
  if (!access_token) {
    const refresh_token = await client.get("refresh_token");
    access_token = await refreshToken(client, refresh_token);
  }
  const {
    data: { id: user_id },
  } = await axios.get("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  await axios.post(
    `https://api.spotify.com/v1/users/${user_id}/playlists`,
    { name },
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  res.send("playlist created");
});

app.get("/account", async (req, res) => {
  try {
    const {
      data: { access_token, refresh_token },
    } = await axios.post("https://accounts.spotify.com/api/token", undefined, {
      params: {
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: redirect_uri,
      },
      headers: {
        Authorization: `Basic ${encodedAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    await client.setEx("access_token", 3600, access_token);
    await client.setEx("refresh_token", 3600 * 12, refresh_token);
    res.redirect(`${client_url}`); // Redirect to a success page
  } catch (error) {
    console.error(error);
    res.redirect(`${client_url}/error`); // Redirect to an error page
  }
});
app.listen(port, () => {
  console.log(`⚡ [server]: Server is running at http://localhost:${port}`);
});

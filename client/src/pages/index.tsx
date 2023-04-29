import { Inter } from "next/font/google";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { api_url, lastfm_api } from "@/constants";
import { useDebounce, useDebouncedCallback } from "use-debounce";

const inter = Inter({ subsets: ["latin"] });

export default function Home({
  display_name,
  playlists_items,
  error,
}: {
  display_name: string;
  playlists_items: { [k: string]: any };
  error: string;
}) {
  const { register, handleSubmit } = useForm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [artist, setArtist] = useState<string>("");
  const [recomArtists, setRecomArtists] = useState<{ [k: string]: any }[]>([]);
  const [debouncedText] = useDebounce(artist, 500);
  const [isToggleChecked, setIsToggleChecked] = useState<boolean>(false);
  const onSubmit = async (data) => {
    await fetch(
      `${api_url}/get-artist?artist=${data.artist}&id=${data.playlist}&full=${data.full}`
    );
  };

  const onSubmitCreate = (e: React.SyntheticEvent) => {
    //need to put this, or else the page will refresh
    e.preventDefault();
    if (inputRef.current)
      fetch(`${api_url}/create-playlist?name=${inputRef.current.value}`).then(
        console.log
      );
  };

  const debounced = useDebouncedCallback(
    // function
    async (value) => {
      if (value === "") return;
      // const data = await fetch(
      //   `https://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=${value}&api_key=${lastfm_api}&format=json&limit=20`
      // );
      // const {
      //   similarartists: { artist: artists },
      // } = await data.json();
      // console.log(value);
      const query = encodeURIComponent(
        `https://api.spotify.com/v1/search?q=${value}&type=artist&market=US&limit=1`
      );
      const res = await fetch(`${api_url}/data?query=${query}`);
      const {
        artists: { items = [] },
      } = await res.json();
      const [{ id }] = items;
      const res2 = await fetch(
        `${api_url}/data?query=https://api.spotify.com/v1/recommendations?seed_artists=${id}&market=US`
      );
      const { tracks } = await res2.json();
      const filterArt =
        //const filterArt = artists.filter((el) => el.popularity < 50);
        setRecomArtists(filterArt);
    },
    // delay in ms
    500
  );

  const fetchArtistId = async () => {
    const id = await fetch(`${api_url}/data/?query=
    https://api.spotify.com/v1/search?q=${debouncedText}`);
    console.log(id);
  };

  return (
    <>
      {error ? (
        <nav className="flex items-center justify-between p-3">
          <div>
            <Link href="/api/auth">
              <button className="rounded-full bg-green-600 text-white p-2">
                Log in to Spotify
              </button>
            </Link>
          </div>
        </nav>
      ) : (
        <>
          <nav className="flex items-center justify-between p-3">
            <div>
              <Link href="/api/auth">
                <button className="rounded-full bg-green-600 text-white p-2">
                  Logged in
                </button>
              </Link>
            </div>
            <div>
              <p>{display_name ? `Hello ${display_name}` : "Please login"}</p>
            </div>
          </nav>
          <main
            className={`flex min-h-screen flex-col items-center  p-8 ${inter.className}`}
          >
            <p className="text-3xl font-bold pb-3">Spotify Playlist Helper</p>
            <div className="py-4">
              <form onSubmit={onSubmitCreate}>
                <div className="space-x-4 flex items-center">
                  <input
                    className="input w-auto"
                    ref={inputRef}
                    placeholder="Name of the playlist"
                  />
                  <button
                    type="submit"
                    className="btn rounded-full bg-orange-500 mx-3"
                  >
                    create new playlist
                  </button>
                </div>
              </form>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-x-4 flex items-center">
                <p>Add to existing playlist</p>
                <input
                  className="input"
                  {...register("artist")}
                  placeholder="Type here desired artists to add"
                  onChange={(e) => debounced(e.target.value)}
                />
                <select
                  className="select w-full max-w-xs"
                  {...register("playlist")}
                  defaultValue={""}
                >
                  <option value="" disabled>
                    Select your Playlist
                  </option>
                  {playlists_items.map(
                    ({ name, id }: { name: string; id: string }) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    )
                  )}
                </select>
                <div className="flex flex-col items-center w-[150px]">
                  <p className="label-text">
                    {isToggleChecked ? "Full Discography" : "Top 10 songs"}
                  </p>
                  <input
                    type="checkbox"
                    className="toggle"
                    checked={isToggleChecked}
                    {...register("full")}
                    onChange={(e) => setIsToggleChecked(e.target.checked)}
                  />
                </div>
                <button className="btn rounded-full bg-blue-500" type="submit">
                  Add Artist
                </button>
              </div>
            </form>
            <div className="mt-8 space-y-4">
              <p>
                Based on your query, here's a list of artists that might
                interest you:
              </p>
              <div className="grid grid-cols-4 gap-4">
                {(recomArtists || []).map((el) => (
                  <div className="flex flex-col items-center">
                    <img
                      className="h-[160px] w-[160px] object-cover object-top"
                      src={el.images.at(-1)["url"]}
                    />
                    <p className="mt-2">{el.name}</p>
                    {/* <p className="text-slate-500">{el.genres[0]}</p> */}
                  </div>
                ))}
              </div>
            </div>
          </main>
        </>
      )}
    </>
  );
}

export async function getStaticProps() {
  try {
    const res = await Promise.all([
      fetch(`${api_url}/data?query=https://api.spotify.com/v1/me`),
      fetch(`${api_url}/data?query=https://api.spotify.com/v1/me/playlists`),
    ]);
    const [user, playlists] = await Promise.all(res.map((r) => r.json()));
    const { display_name = null } = user;
    const { items: playlists_items = [] } = playlists;

    return { props: { display_name, playlists_items } };
  } catch (e: any) {
    console.log(e);
    return { props: { error: e.message } };
  }
}

import { Inter } from "next/font/google";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { api_url, lastfm_api } from "@/constants";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import axios from "axios";
import { LoadingImage } from "@/components/LoadingImage";
import { getValueByKey } from "@/utils/utils";

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
  const { register, handleSubmit, resetField } = useForm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [artist, setArtist] = useState<string>("");
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
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

      try {
        setLoadingImage(true);
        const { data: similarArtistsArr } = (await axios.get(
          `api/artist/${value}`
        )) as { data: { [k: string]: any }[] };
        await Promise.all(
          similarArtistsArr.map(async (el) => {
            const { data: img } = await axios.get(
              `/api/artist/lastFm/${el.name}`
            );
            const { data: artistData } = await axios.get(
              `/api/artist/spotify/${el.name}`
            );
            el["genres"] = artistData.genres;
            el["href"] = artistData.href;
            el["images"] = artistData.images;
            el["image"] = img;
          })
        );
        setRecomArtists(similarArtistsArr);
        setLoadingImage(false);
      } catch (e) {
        console.log(e);
      }
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
                <label
                  htmlFor="default-search"
                  className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                >
                  Search
                </label>
                <div className="relative ">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        //stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type="search"
                    id="default-search"
                    className="input text-sm rounded-lg block w-full pl-10 p-2.5  "
                    {...register("artist")}
                    placeholder="Type here desired artists to add"
                    onChange={(e) => debounced(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => resetField("artist")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                        fill="white"
                      ></path>
                    </svg>
                  </button>
                </div>
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
                <div className="flex flex-col items-center w-[150px] space-y-2">
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
                {(recomArtists || []).map(({ name, ...el }) => (
                  <div className="flex flex-col items-center" key={name}>
                    <a href={el.href} target="_blank">
                      {loadingImage ? (
                        <LoadingImage />
                      ) : (
                        <img
                          className="h-[160px] w-[160px] object-cover object-top"
                          src={el.image ?? el.images?.at(0)["url"]}
                        />
                      )}
                    </a>
                    <p className="mt-2 mb-1">{name}</p>
                    <div className="flex space-x-2">
                      {(el.genres?.slice(0, 2) || []).map((genre: string) => (
                        <div key={genre} className="badge badge-sm truncate">
                          {genre}
                        </div>
                      ))}
                    </div>
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
      axios.get(`${api_url}/data?query=https://api.spotify.com/v1/me`),
      axios.get(
        `${api_url}/data?query=https://api.spotify.com/v1/me/playlists`
      ),
    ]);
    const [user, playlists] = res;
    const display_name = getValueByKey(["data", "display_name"], user);
    const playlists_items = getValueByKey(["data", "items"], playlists);

    return { props: { display_name, playlists_items } };
  } catch (e: any) {
    console.log(e);
    return { props: { error: e.message } };
  }
}

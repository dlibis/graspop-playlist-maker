import { Inter } from "next/font/google";
import Link from "next/link";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { api_url } from "@/constants";

const inter = Inter({ subsets: ["latin"] });

export default function Home({
  display_name,
  playlists_items,
}: {
  display_name: string;
  playlists_items: { [k: string]: any };
}) {
  const { register, handleSubmit } = useForm();
  const inputRef = useRef<HTMLInputElement>(null);
  console.log(api_url);
  const onSubmit = async (data) => {
    await fetch(
      `${api_url}/get-artist?artist=${data.artist}&id=${data.playlist}`
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
  return (
    <>
      <nav className="flex items-center justify-between p-3">
        <div>
          <Link href="/api/auth">
            <button className="rounded-full bg-green-600 text-white p-2">
              Login to Spotify
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
            />
            <select
              className="select w-full max-w-xs"
              {...register("playlist")}
              defaultValue={0}
            >
              <option disabled>Select your Playlist</option>
              {playlists_items.map(
                ({ name, id }: { name: string; id: string }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                )
              )}
            </select>
            <button className="btn rounded-full bg-blue-500" type="submit">
              Add Artist
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export async function getStaticProps() {
  const res = await Promise.all([
    fetch(`${api_url}/user`),
    fetch(`${api_url}/user?type=playlists`),
  ]);
  const [user, playlists] = await Promise.all(res.map((r) => r.json()));
  const {
    data: { display_name },
  } = user;
  const {
    data: { items: playlists_items },
  } = playlists;
  // const {
  //   data: { display_name },
  // } = await res.json();

  return { props: { display_name, playlists_items } };
}

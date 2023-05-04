import { useRef, useState } from 'react';

import axios from 'axios';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDebouncedCallback } from 'use-debounce';

import Logo from '../../public/images/logo.svg';
import { ArtistForm } from '@/components/ArtistForm';
import { ArtistGrid } from '@/components/ArtistGrid';
import { api_url } from '@/constants';
import { getValueByKey } from '@/utils/utils';

const inter = Inter({ subsets: ['latin'] });

export default function Home({
  display_name,
  playlists_items,
  error,
}: {
  display_name: string;
  playlists_items: { [k: string]: any }[];
  error: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [recomArtists, setRecomArtists] = useState<{
    data: { [k: string]: any }[];
    searchType: 'initial' | 'getData' | 'reset';
  }>({ data: [], searchType: 'initial' });
  const [playlists, setPlaylists] =
    useState<{ [k: string]: any }[]>(playlists_items);

  const onSubmitCreate = async (e: React.SyntheticEvent) => {
    //  need to put this, or else the page will refresh
    e.preventDefault();
    if (inputRef.current) {
      await toast.promise(
        axios.get(`${api_url}/create-playlist?name=${inputRef.current.value}`),
        {
          pending: 'Creating playlist',
          success: `${inputRef.current.value} playlist created!`,
          error: 'Failed to create the playlist',
        },
        {
          position: 'top-center',
          theme: 'dark',
        },
      );

      const { data } = await axios.get(
        `${api_url}/data?query=https://api.spotify.com/v1/me/playlists`,
      );
      setPlaylists(data.items);
    }
  };

  const debounced = useDebouncedCallback(
    // function
    async (value) => {
      if (value === '') return;
      try {
        const { data: similarArtistsArr } = (await axios.get(
          `api/artist/${value}`,
        )) as { data: { [k: string]: any }[] };
        setLoadingImage(true);
        Promise.all(
          similarArtistsArr.map(({ image, ...el }) => {
            return axios
              .get(`/api/artist/spotify/${el.name}`)
              .then(({ data: artistData }) => {
                el['genres'] = artistData.genres;
                el['href'] = artistData.href;
                el['images'] = artistData.images;
                return el;
              });
          }),
        ).then((updatedArray) => {
          setRecomArtists({ data: updatedArray, searchType: 'getData' });
          setLoadingImage(false);
        });
        setLoadingImage(false);
      } catch (e) {
        console.log(e);
      }
    },
    // delay in ms
    500,
  );

  const handleResetQuery = () =>
    setRecomArtists({ data: [], searchType: 'reset' });

  return (
    <>
      <nav className="flex items-center justify-between p-3">
        <div className="flex items-center">
          <Logo />
          <div className="text-xl font-bold pb-3">Spotify Mixmaster</div>
        </div>
        <div>
          <Link href="/api/auth">
            <button className="rounded-full bg-success text-white p-2">
              <p>{display_name ? `Hello ${display_name}` : 'Please login'}</p>
            </button>
          </Link>
        </div>
      </nav>
      <main className="flex flex-col items-center ">
        {!error ? (
          <>
            {/* <main
            className={`flex min-h-screen flex-col items-center  p-8 ${inter.className}`}
          > */}
            <ToastContainer autoClose={2000} />
            <div className="py-4 bg-black w-full">
              <form onSubmit={onSubmitCreate}>
                <div className="space-x-4 flex items-center justify-center">
                  <input
                    className="input w-auto"
                    ref={inputRef}
                    placeholder="Name of the playlist"
                  />
                  <button
                    type="submit"
                    className="btn rounded-full bg-primary mx-3"
                  >
                    create new playlist
                  </button>
                </div>
              </form>
            </div>
            <div className="divider" />
            <div>
              <ArtistForm
                playlists={playlists}
                debounced={debounced}
                handleResetQuery={handleResetQuery}
              />
              <ArtistGrid
                recomArtists={recomArtists.data}
                loadingImage={loadingImage}
                searchType={recomArtists.searchType}
              />
            </div>
            {/* </main> */}
          </>
        ) : (
          <div className=" container max-w-screen-sm mx-auto text-center">
            Greetings, fellow user! The utility is ready for your command, but
            before proceeding, we require the proper credentials, please press
            the login button
          </div>
        )}
      </main>
    </>
  );
}

export async function getStaticProps() {
  try {
    const res = await Promise.all([
      axios.get(`${api_url}/data?query=https://api.spotify.com/v1/me`),
      axios.get(
        `${api_url}/data?query=https://api.spotify.com/v1/me/playlists`,
      ),
    ]);
    const [user, playlists] = res;
    const display_name = getValueByKey(['data', 'display_name'], user);
    const playlists_items = getValueByKey(['data', 'items'], playlists);

    return { props: { display_name, playlists_items } };
  } catch (e: any) {
    console.log(e);
    return { props: { error: e.message } };
  }
}

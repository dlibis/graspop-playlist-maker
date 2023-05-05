import { useRef, useState } from 'react';

import axios from 'axios';
import { Inter } from 'next/font/google';
import Head from 'next/head';
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
  const [freezeResults, setFreezeResults] = useState<boolean>(false);
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
      if (value === '' || freezeResults) return;
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

  const handleResetQuery = () => {
    if (freezeResults) return;
    setRecomArtists({ data: [], searchType: 'reset' });
    setFreezeResults(false);
  };

  return (
    <>
      <Head>
        <title>Spotify Mixmaster</title>
        <meta name="description" content="This is my page description." />
      </Head>
      <nav className="flex items-center justify-between p-3 h-[var(--nav-height)]">
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
      <main>
        <div className="container ">
          {!error ? (
            <>
              <ToastContainer autoClose={2000} />
              <div>
                <ArtistForm
                  playlists={playlists}
                  debounced={debounced}
                  handleResetQuery={handleResetQuery}
                />
                <div className="divider my-1" />
                <div className="container ">
                  <div
                    tabIndex={0}
                    className="collapse collapse-plus border border-base-300 bg-base-100 rounded-box "
                  >
                    <input type="checkbox" />
                    <div className="collapse-title text-md font-medium p-[0.5rem] min-h-[2rem]">
                      Create a new playlist
                    </div>
                    <div className="collapse-content">
                      <form onSubmit={onSubmitCreate}>
                        <div className="sm:space-x-4 sm:space-y-0 flex items-center justify-center flex-wrap space-y-4">
                          <input
                            className="input input-bordered focus:input-primary my-2"
                            ref={inputRef}
                            placeholder="Name of the playlist"
                          />
                          <button
                            type="submit"
                            className="btn rounded-full bg-primary"
                          >
                            create new playlist
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <ArtistGrid
                  recomArtists={recomArtists.data}
                  loadingImage={loadingImage}
                  searchType={recomArtists.searchType}
                  handleFreezeResults={setFreezeResults}
                  freezeResuls={freezeResults}
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
        </div>
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

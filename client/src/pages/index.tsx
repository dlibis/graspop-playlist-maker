import { MouseEventHandler, useRef, useState } from 'react';

import axios from 'axios';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
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
  console.log(error);
  const inputRef = useRef<HTMLInputElement>(null);
  const [freezeResults, setFreezeResults] = useState<boolean>(false);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [recomArtists, setRecomArtists] = useState<{
    data: { [k: string]: any }[];
    searchType: 'initial' | 'getData' | 'reset';
  }>({ data: [], searchType: 'initial' });
  const [playlists, setPlaylists] =
    useState<{ [k: string]: any }[]>(playlists_items);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

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

  const handleFreezeResults = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>,
  ) => setFreezeResults((e.target as HTMLInputElement).checked);

  const handleSelectedArtist = (value: string) => {
    setSelectedArtist(value);
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
                  selectedArtist={selectedArtist}
                />
                <div className="divider my-1" />
                <div className="container ">
                  <div
                    tabIndex={0}
                    className="collapse collapse-plus border border-base-300 rounded-box bg-opacity-75 bg-slate-600"
                  >
                    <input type="checkbox" />
                    <div className="collapse-title text-md font-medium ">
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
                  handleFreezeResults={handleFreezeResults}
                  freezeResults={freezeResults}
                  handleSelectedArtist={handleSelectedArtist}
                />
              </div>

              {/* </main> */}
            </>
          ) : (
            <div className=" container max-w-screen-sm mx-auto text-center">
              <div className="alert shadow-lg">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-info flex-shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>
                    Greetings, fellow user! The utility is ready for your
                    command, but before proceeding, we require the proper
                    credentials, please press the login button
                  </span>
                </div>
              </div>
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

    return { props: { display_name, playlists_items }, revalidate: 10 };
  } catch (e: any) {
    console.log(e);
    return { props: { error: e.message } };
  }
}

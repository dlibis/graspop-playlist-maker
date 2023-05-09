import { useRef, useState } from 'react';

import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import { useDebouncedCallback } from 'use-debounce';

import Logo from '../../public/images/logo.svg';
import { ArtistForm } from '@/components/ArtistForm';
import { ArtistGrid } from '@/components/ArtistGrid';
import { apiUrl } from '@/constants';
import { getValueByKey } from '@/utils/utils';

type Props = {
  displayName: string;
  playlistsItems: { [k: string]: any }[];
  error: string;
};

const Home: React.FC<Props> = ({ displayName, playlistsItems, error }) => {
  console.log(apiUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const [freezeResults, setFreezeResults] = useState<boolean>(false);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [recomArtists, setRecomArtists] = useState<{
    data: { [k: string]: any }[];
    searchType: 'initial' | 'getData' | 'reset';
  }>({ data: [], searchType: 'initial' });
  // eslint-disable-next-line prettier/prettier
  const [playlists, setPlaylists] = useState<Record<string, any>[]>(playlistsItems);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  const onSubmitCreate = async (e: React.SyntheticEvent) => {
    //  need to put this, or else the page will refresh
    e.preventDefault();
    if (inputRef.current) {
      await toast.promise(
        axios.get(`${apiUrl}/create-playlist?name=${inputRef.current.value}`),
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
        `${apiUrl}/data?query=https://api.spotify.com/v1/me/playlists`,
      );
      setPlaylists(data.items);
    }
  };

  const debounced = useDebouncedCallback(
    // function
    async (value) => {
      if (value === '' || freezeResults) return;
      try {
        const { data: similarArtistsArr } = (await axios.get(`/artist/${value}`)) as {
          data: { [k: string]: any }[];
        };
        setLoadingImage(true);
        Promise.all(
          similarArtistsArr.map(({ image, ...el }) => {
            const obj: { [k: string]: any } = {};
            /* eslint-disable-line */
            return axios.get(`/artist/spotify/${el.name}`).then(({ data: artistData }) => {
              obj.genres = artistData.genres;
              obj.href = artistData.href;
              obj.images = artistData.images;
              return { ...el, ...obj };
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

  const handleFreezeResults = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    setFreezeResults((e.target as HTMLInputElement).checked);

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
            <button type="button" className="rounded-full bg-success text-white p-2">
              <p>{displayName ? `Hello ${displayName}` : 'Please login'}</p>
            </button>
          </Link>
          <button
            onClick={() => {
              axios
                .get(`${apiUrl}/spotify/data?query=https://api.spotify.com/v1/me`)
                .then(({ res }) => console.log(res));
            }}
            type="button"
            className="rounded-full bg-success text-white p-2"
          >
            <p>test</p>
          </button>
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
                    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                    tabIndex={0}
                    className="collapse collapse-plus border border-base-300 rounded-box bg-opacity-75 bg-slate-600"
                  >
                    <input type="checkbox" />
                    <div className="collapse-title text-md font-medium ">Create a new playlist</div>
                    <div className="collapse-content">
                      <form onSubmit={onSubmitCreate}>
                        <div className="sm:space-x-4 sm:space-y-0 flex items-center justify-center flex-wrap space-y-4">
                          <input
                            className="input input-bordered focus:input-primary my-2"
                            ref={inputRef}
                            placeholder="Name of the playlist"
                          />
                          <button type="submit" className="btn rounded-full bg-primary">
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
                    />
                  </svg>
                  <span>
                    Greetings, fellow user! The utility is ready for your command, but before
                    proceeding, we require the proper credentials, please press the login button
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export async function getStaticProps() {
  try {
    const res = await Promise.all([
      axios.get(`${apiUrl}/spotify/data?query=https://api.spotify.com/v1/me`),
      axios.get(`${apiUrl}/spotify/data?query=https://api.spotify.com/v1/me/playlists`),
    ]);
    const [user, playlists] = res;
    const displayName = getValueByKey(['data', 'display_name'], user);
    const playlistsItems = getValueByKey(['data', 'items'], playlists);

    return { props: { displayName, playlistsItems } };
  } catch (e: any) {
    console.error(e.message);
    return { props: { error: e.message } };
  }
}
export default Home;

/* eslint-disable no-nested-ternary */

/* eslint-disable jsx-a11y/label-has-associated-control */

/* eslint-disable jsx-a11y/no-noninteractive-tabindex */

/* eslint-disable react/jsx-one-expression-per-line */

/* eslint-disable object-curly-newline */
import { useEffect, useRef, useState } from 'react';

import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import { useDebouncedCallback } from 'use-debounce';

import { ArtistForm } from '@/components/ArtistForm';
import { ArtistGrid } from '@/components/ArtistGrid';
import { apiUrl } from '@/constants';
import useGetSpotifyData from '@/hooks/useGetSpotifyData';

// type Props = {
//   displayName: string;
//   playlistsItems: { [k: string]: any }[];
//   error: any;
// };

const Home: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [freezeResults, setFreezeResults] = useState<boolean>(false);
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [recomArtists, setRecomArtists] = useState<{
    data: { [k: string]: any }[];
    searchType: 'initial' | 'getData' | 'reset';
  }>({ data: [], searchType: 'initial' });

  // eslint-disable-next-line prettier/prettier
  // @ts-ignore
  const { playlistsItems: playlists, error, handleUpdatePlaylist } = useGetSpotifyData();

  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  const onSubmitCreate = async (e: React.SyntheticEvent) => {
    //  need to put this, or else the page will refresh
    e.preventDefault();
    if (inputRef.current) {
      await toast.promise(
        axios.get(`/spotify/create-playlist?name=${inputRef.current.value}`),
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
        `/spotify/data?query=https://api.spotify.com/v1/me/playlists`,
      );
      handleUpdatePlaylist(data.items);
    }
  };

  const debounced = useDebouncedCallback(
    // function
    async (value) => {
      if (value === '' || freezeResults) return;
      try {
        // ts-ignore
        const { data: similarArtistsArr } = await toast.promise(
          axios.get(`/artist/${value}`),
          {
            pending: `Searching ${value}`,
            success: 'Search completed 👌',
            error: 'some error happened',
          },
          {
            position: 'top-center',
            theme: 'dark',
          },
        );
        setLoadingImage(true);
        Promise.all(
          similarArtistsArr.map(({ image, ...el }) => {
            const obj: { [k: string]: any } = {};
            /* eslint-disable-line */
            const artist = el.name.replace('/', '\\');
            return axios.get(`/artist/spotify/${artist}`).then(({ data: artistData }) => {
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
          <>
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
            <div className="text-transparent overflow-hidden">{error}</div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;

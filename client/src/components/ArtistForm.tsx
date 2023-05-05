import React, { ChangeEvent, SyntheticEvent, useState } from 'react';

import axios from 'axios';
import { useForm } from 'react-hook-form';

import { api_url } from '@/constants';

type Props = {
  handleResetQuery: () => void;
  debounced: (value: string) => void;
  playlists: { [k: string]: any }[];
};

export const ArtistForm: React.FC<Props> = ({
  handleResetQuery,
  debounced,
  playlists,
}) => {
  const [isToggleChecked, setIsToggleChecked] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<{ artist: string; playlist: string; full: boolean }>();
  const onSubmit = async (data) => {
    await axios.get(
      `${api_url}/get-artist?artist=${data.artist}&id=${data.playlist}&full=${data.full}`,
    );
  };

  const handleSetToggle = (e: ChangeEvent<HTMLInputElement>) =>
    setIsToggleChecked(e.target.checked);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 justify-center md:space-x-4 md:space-y-0 flex items-center flex-wrap ">
        <p>Add to existing playlist</p>
        <div className="flex gap-3">
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
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                  strokeWidth={'2'}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <div>
              <input
                type="search"
                id="default-search"
                className="input bg-neutral text-sm rounded-lg block w-full pl-10 p-2.5  flex-1 focus:input-primary "
                {...register('artist', { required: true })}
                placeholder="Type here desired artists to add"
                onChange={(e) => {
                  debounced(e.target.value);
                }}
              />
              {errors.artist && (
                <p className="text-error">Artist name is needed</p>
              )}
            </div>
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => {
                resetField('artist');
                handleResetQuery();
              }}
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
          <div>
            <select
              className="select flex-1 focus:input-primary "
              {...register('playlist', { required: true })}
              defaultValue={''}
            >
              <option value="" disabled>
                Select your Playlist
              </option>
              {playlists.map(({ name, id }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            {errors.playlist && (
              <p className="text-error absolute left-[49%]">
                You need to pick a playlist
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center w-[150px] space-y-2 ">
          <p className="label-text">
            {isToggleChecked ? 'Full Discography' : 'Top 10 songs'}
          </p>
          <input
            type="checkbox"
            className="toggle"
            checked={isToggleChecked}
            {...register('full')}
            onChange={handleSetToggle}
          />
        </div>
        <button
          className="btn btn-xs sm:btn-sm rounded-full bg-primary "
          type="submit"
        >
          Add Artist
        </button>
      </div>
    </form>
  );
};

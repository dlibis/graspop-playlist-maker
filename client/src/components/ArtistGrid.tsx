import { ChangeEvent } from 'react';

import { InfoAlert } from '@/components/InfoAlert';
import { LoadingImage } from '@/components/LoadingImage';

export const ArtistGrid = ({
  recomArtists,
  loadingImage,
  searchType,
  handleFreezeResults,
  freezeResults,
}) => {
  return (
    <>
      {recomArtists.length > 0 ? (
        <div className="space-y-4 bg-black bg-opacity-30 rounded-t-xl mt-8 p-8">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <p>
              Based on your query, here&apos;s a list of artists that might
              interest you:
            </p>
            <div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text pr-2">Freeze results</span>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={freezeResults}
                    onClick={(
                      e: React.MouseEvent<HTMLInputElement, MouseEvent>,
                    ) =>
                      handleFreezeResults(
                        (e.target as HTMLInputElement).checked,
                      )
                    }
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {recomArtists.map(({ name, ...el }) => (
              <div className="flex flex-col items-center" key={name}>
                <a href={el.href} target="_blank">
                  {loadingImage ? (
                    <LoadingImage />
                  ) : (
                    <img
                      alt={name}
                      className="h-[160px] w-[160px] object-cover object-top"
                      src={el.images?.at(0)?.url}
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
      ) : searchType === 'getData' ? (
        <InfoAlert
          text={
            "The artist you queried is very unique and didn't return any results 😔"
          }
        />
      ) : null}
    </>
  );
};

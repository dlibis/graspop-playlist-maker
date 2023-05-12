import { InfoAlert } from '@/components/InfoAlert';
import { LoadingImage } from '@/components/LoadingImage';

type Props = {
  recomArtists: { [k: string]: any }[];
  loadingImage: boolean;
  searchType: 'initial' | 'getData' | 'reset';
  handleFreezeResults: (e) => void;
  freezeResults: boolean;
  handleSelectedArtist: (value: string) => void;
};

export const ArtistGrid: React.FC<Props> = ({
  recomArtists,
  loadingImage,
  searchType,
  handleFreezeResults,
  freezeResults,
  handleSelectedArtist,
}) => {
  return (
    <>
      {recomArtists.length > 0 ? (
        <div className="space-y-4 bg-black bg-opacity-30 rounded-t-xl mt-8 p-8">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <p>Based on your query, here&apos;s a list of artists that might interest you:</p>
            <div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text pr-2">Freeze results</span>
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={freezeResults}
                    onChange={handleFreezeResults}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="tooltip" data-tip="Click to add to playlist">
                  <button
                    onClick={() => handleSelectedArtist(name)}
                    className="btn btn-ghost btn-sm my-2"
                  >
                    {name}
                  </button>
                </div>
                {/* <p className="mt-2 mb-1">{name}</p> */}
                <div className="flex space-x-2 flex-wrap lg:space-y-0 space-y-2 justify-center">
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
        <div className="container max-w-xl my-8">
          <InfoAlert
            text={"The artist you queried is very unique and didn't return any results 😔"}
          />
        </div>
      ) : null}
    </>
  );
};

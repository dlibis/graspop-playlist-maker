import { useEffect, useState } from 'react';

import axios from 'axios';
import { cookies } from 'next/headers';

import { apiUrl } from '@/constants';
import { getValueByKey } from '@/utils/utils';

const useGetSpotifyData = () => {
  const [displayName, setDisplayName] = useState<string>('');
  const [playlistsItems, setPlaylistsItems] = useState<Record<string, any>[]>([]);
  const [loading, SetLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleUpdatePlaylist = (data) => {
    setPlaylistsItems(data);
  };

  const fetchData = async () => {
    try {
      const res = await Promise.all([
        axios.get(`${apiUrl}/spotify/data?query=https://api.spotify.com/v1/me`),
        axios.get(`${apiUrl}/spotify/data?query=https://api.spotify.com/v1/me/playlists`),
      ]);
      const [user, playlists] = res;
      const displayNameRes = getValueByKey(['data', 'display_name'], user);
      const playlistsItemsRes = getValueByKey(['data', 'items'], playlists);
      setDisplayName(displayNameRes);
      setPlaylistsItems(playlistsItemsRes);
    } catch (e: any) {
      setResponseStatus(e.response.status);
      console.error(e.message);
      setError(JSON.stringify(e));
    }
  };
  useEffect(() => {
    (async () => {
      SetLoading(true);
      await fetchData();
      SetLoading(false);
    })();
  }, []);

  return {
    displayName,
    playlistsItems,
    error,
    loading,
    handleUpdatePlaylist,
    responseStatus,
  };
};

export default useGetSpotifyData;

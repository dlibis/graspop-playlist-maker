import { useCallback, useEffect, useState } from 'react';

import axios from 'axios';
import Cookies from 'js-cookie';

import { getValueByKey } from '@/utils/utils';

const useGetSpotifyData = () => {
  const [displayName, setDisplayName] = useState<string>('');
  const [playlistsItems, setPlaylistsItems] = useState<Record<string, any>[]>([]);
  const [loading, SetLoading] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const cookie = Cookies.get('connect.sid');

  const handleUpdatePlaylist = (data) => {
    setPlaylistsItems(data);
  };

  const fetchUserName = useCallback(async () => {
    try {
      const res = await axios.get(`/spotify/data?query=https://api.spotify.com/v1/me`);
      const displayNameRes = getValueByKey(['data', 'display_name'], res);
      setDisplayName(displayNameRes);
    } catch (error: any) {
      if (error.response.status === 403) {
        Cookies.remove('connect.sid');
      }
      console.error(error.message);
    }
  }, []);

  const fetchPlaylists = useCallback(async () => {
    try {
      const res = await axios.get(`/spotify/data?query=https://api.spotify.com/v1/me/playlists`);
      const playlistsItemsRes = getValueByKey(['data', 'items'], res);
      setPlaylistsItems(playlistsItemsRes);
    } catch (e: any) {
      console.error(e.message);
      setError(JSON.stringify(error));
    }
  }, [error]);

  useEffect(() => {
    cookie ? setLoggedIn(true) : setLoggedIn(false);
  }, [cookie]);

  useEffect(() => {
    if (!loggedIn) {
      return;
    } else {
      (async () => {
        await fetchUserName();
        await fetchPlaylists();
      })();
    }
  }, [fetchPlaylists, fetchUserName, loggedIn]);

  return {
    displayName,
    playlistsItems,
    error,
    loading,
    handleUpdatePlaylist,
    loggedIn,
  };
};

export default useGetSpotifyData;

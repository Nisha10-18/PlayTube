import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { serverUrl } from "../App";

import {
  setSubscribedChannels,
  setSubscribedVideos,
  setSubscribedShorts,
  setSubscribedPlaylists,
  setSubscribedPosts,
} from "../redux/userSlice";

function GetSubscribedData() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSubscribedData = async () => {
      try {
        const result = await axios.get(
          serverUrl + "/api/user/subscribed-data",
          { withCredentials: true }
        );

        console.log(result.data);

        dispatch(setSubscribedChannels(result.data.subscribedChannels));
        dispatch(setSubscribedVideos(result.data.videos));
        dispatch(setSubscribedShorts(result.data.shorts));
        dispatch(setSubscribedPlaylists(result.data.playlists));
        dispatch(setSubscribedPosts(result.data.posts));
      } catch (error) {
        console.log(error);
      }
    };

    fetchSubscribedData();
  }, [dispatch]);

  return null;
}

export default GetSubscribedData;
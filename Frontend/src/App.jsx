import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Home from "./Pages/Home";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import CustomAlert, { showCustomAlert } from "./components/CustomAlert";
import Shorts from "./Pages/Shorts/Shorts";
import GetCurrentUser from "./customHooks/GetCurrentUser";
import MobileProfile from "./components/MobileProfile";
import ForgotPassword from "./Pages/ForgotPassword";
import CreateChannel from "./Pages/Channel/CreateChannel";
import ViewChannel from "./Pages/Channel/ViewChannel";
import GetChannelData from "./customHooks/GetChannelData";
import UpdateChannel from "./Pages/Channel/UpdateChannel";
import CreatePage from "./Pages/CreatePage";
import CreateVideo from "./Pages/Videos/CreateVideo";
import CreateShort from "./Pages/Shorts/CreateShort";
import CreatePlayList from "./Pages/PlayList/CreatePlayList";
import CreatePost from "./Pages/Post/CreatePost";
import GetAllContentData from "./customHooks/GetAllContentData";
import PlayVideo from "./Pages/Videos/PlayVideo";
import ChannelPage from "./Pages/Channel/ChannelPage";
import PlayShort from "./Pages/Shorts/PlayShort";
import LikedContent from "./Pages/LikedContent";
import SavedContent from "./Pages/SavedContent";
import SavedPlaylist from "./Pages/PlayList/SavedPlaylist";
import GetSubscribedData from "./customHooks/GetSubscribedData";
import Subscription from "./Pages/Subscription";
import GetHistory from "./customHooks/GetHistory";
import HistoryContent from "./Pages/HistoryContent";
import GetRecommendedContent from "./customHooks/GetRecommendedContent";
import Revenue from "./components/Revenue";
import Content from "./components/Content";
import Analytics from "./components/Analytics";
import Dashboard from "./components/Dashboard";
import PTStudio from "./Pages/PTStudio";
import UpdateVideo from "./Pages/Videos/UpdateVideo";
import UpdateShort from "./Pages/Shorts/UpdateShort";
import UpdatePlaylist from "./Pages/Playlist/UpdatePlaylist";





export const serverUrl = "http://localhost:8000";

/* ================= PROTECTED ROUTE ================= */
const ProtectRoute = ({ userData, children }) => {
  if (!userData) {
    showCustomAlert("Please sign up first to use this feature!");
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  GetCurrentUser();
  GetChannelData();
  GetAllContentData();
  GetSubscribedData();
  GetHistory();
  GetRecommendedContent()

  const { userData } = useSelector((state) => state.user);
  function ChannelPageWrapper(){
  const location = useLocation();
  return <ChannelPage key={location.pathname} />;
  }
  return (
    <>
      <CustomAlert />
      <Routes>

        <Route path="/" element={<Home />}>
          <Route
            path="/shorts"
            element={
              <ProtectRoute userData={userData}>
                <Shorts />
              </ProtectRoute>
            }
          />
 
          <Route
            path="/playshort/:shortId"
            element={
              <ProtectRoute userData={userData}>
                <PlayShort />
              </ProtectRoute>
            }
          />

          <Route
            path="/mobilepro"
            element={
              <ProtectRoute userData={userData}>
                <MobileProfile />
              </ProtectRoute>
            }
          />

          <Route
            path="/viewchannel"
            element={
              <ProtectRoute userData={userData}>
                <ViewChannel />
              </ProtectRoute>
            }
          />

          <Route
            path="/updatechannel"
            element={
              <ProtectRoute userData={userData}>
                <UpdateChannel />
              </ProtectRoute>
            }
          />
       

      
        <Route
          path="/create"
          element={
            <ProtectRoute userData={userData}>
              <CreatePage />
            </ProtectRoute>
          }
        />

        <Route
          path="/createvideo"
          element={
            <ProtectRoute userData={userData}>
              <CreateVideo />
            </ProtectRoute>
          }
        />

        <Route
          path="/createshort"
          element={
            <ProtectRoute userData={userData}>
              <CreateShort />
            </ProtectRoute>
          }
        />

        <Route
          path="/createplaylist"
          element={
            <ProtectRoute userData={userData}>
              <CreatePlayList />
            </ProtectRoute>
          }
        />

        <Route
          path="/createpost"
          element={
            <ProtectRoute userData={userData}>
              <CreatePost />
            </ProtectRoute>
          }
        />
         <Route
          path="/channelpage/:channelId"
          element={
            <ProtectRoute userData={userData}>
              <ChannelPageWrapper />
            </ProtectRoute>
          }
        />



         <Route
          path="/likedcontent"
          element={
            <ProtectRoute userData={userData}>
              <LikedContent/>
            </ProtectRoute>
          }
        />

        <Route
          path="/savedcontent"
          element={
            <ProtectRoute userData={userData}>
              <SavedContent/>
            </ProtectRoute>
          }
        />

        <Route
          path="/savedplaylist"
          element={
            <ProtectRoute userData={userData}>
              <SavedPlaylist/>
            </ProtectRoute>
          }
        />

        <Route
          path="/subscription"
          element={
            <ProtectRoute userData={userData}>
              <Subscription />
            </ProtectRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectRoute userData={userData}>
              <HistoryContent/>
            </ProtectRoute>
          }
        />


         
 </Route>

        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgotpass" element={<ForgotPassword />} />

        <Route
          path="/createchannel"
          element={
            <ProtectRoute userData={userData}>
              <CreateChannel />
            </ProtectRoute>
          }
        />
createvideo
         <Route
          path="/playvideo/:videoId" 
          element={
            <ProtectRoute userData={userData}>
              <PlayVideo />
            </ProtectRoute>
          }
        />

          <Route
          path="/ptstudio" 
          element={
            <ProtectRoute userData={userData}>
              <PTStudio />
            </ProtectRoute>}>

            <Route
          path="/ptstudio/dashboard"
          element={
            <ProtectRoute userData={userData}>
              <Dashboard/>
            </ProtectRoute>
          }
        />

        <Route
          path="/ptstudio/analytics"
          element={
            <ProtectRoute userData={userData}>
              <Analytics/>
            </ProtectRoute>
          }
        />

        <Route
          path="/ptstudio/content"
          element={
            <ProtectRoute userData={userData}>
              <Content/>
            </ProtectRoute>
          }
        />
        <Route
          path="/ptstudio/revenue"
          element={
            <ProtectRoute userData={userData}>
              <Revenue/>
            </ProtectRoute>
          }
        />

        <Route
          path="/ptstudio/updatevideo/:videoId"
          element={
            <ProtectRoute userData={userData}>
              <UpdateVideo/>
            </ProtectRoute>
          }
        />
         <Route
          path="/ptstudio/updateshort/:shortId"
          element={
            <ProtectRoute userData={userData}>
              <UpdateShort
              />
            </ProtectRoute>
          }
        />
        <Route
          path="/ptstudio/updateplaylist/:playlistId"
          element={
            <ProtectRoute userData={userData}>
              <UpdatePlaylist
              />
            </ProtectRoute>
          }
        />
      </Route>
      </Routes>
    </>
  );
}  
                
export default App;
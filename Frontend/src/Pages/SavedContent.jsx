import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { SiYoutubeshorts } from "react-icons/si";
import { GoVideo } from "react-icons/go";
import ShortCard from "../components/ShortCard";
import VideoCard from "../components/VideoCard";

/* ================= VIDEO DURATION ================= */
const getVideoDuration = (url, callback) => {
  const video = document.createElement("video");
  video.preload = "metadata";
  video.src = url;

  video.onloadedmetadata = () => {
    const totalSeconds = Math.floor(video.duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    callback(`${minutes}:${seconds.toString().padStart(2, "0")}`);
  };

  video.onerror = () => {callback("0:00")};
};

function SavedContent() {
  const [savedVideo, setSavedVideo] = useState([]);
  const [savedShort, setSavedShort] = useState([]);
  const [duration, setDuration] = useState({});

  /* ================= VIDEO DURATION EFFECT ================= */
  useEffect(() => {
    if (Array.isArray(savedVideo) && savedVideo.length > 0) {
      savedVideo.forEach((video) => {
        if (video?.videoUrl) {
          getVideoDuration(video.videoUrl, (formattedTime) => {
            setDuration((prev) => ({
              ...prev,
              [video._id]: formattedTime,
            }));
          });
        }
      });
    }
  }, [savedVideo]);

  /* ================= FETCH SAVED CONTENT ================= */
  useEffect(() => {
    const fetchSavedContent = async () => {
      try {
      const result = await axios.get(serverUrl +"/api/content/savedvideo" ,
        {withCredentials : true}
       )
       setSavedVideo(result.data)
       console.log(result.data)

       const result1 = await axios.get(serverUrl + "/api/content/savedshort",
        { withCredentials : true}
       )
       setSavedShort(result1.data)
       console.log(result1.data)
      } catch(error) {
        console.log(error)
      }
    }
    fetchSavedContent();
  }, []);

if((!savedVideo && !savedShort) || (savedVideo.length === 0
  &&savedShort.length === 0)){
 
        return(
            <div className='flex justify-center items-center h-[70vh] text-gray-400
            text-xl'> No Saved content Found</div>

            
        )
    }


  return (
    <div className="px-6 py-4 min-h-screen mt-[50px] lg:mt-[20px]">

      {/* ================= SAVED SHORTS ================= */}
      {savedShort.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-6 pt-[50px] border-b border-gray-300 pb-2 flex items-center gap-2">
            <SiYoutubeshorts className="w-7 h-7 text-red-600" />
            Saved Shorts
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {savedShort.map((short) => (
              <div key={short?._id} className="flex-shrink-0">
                <ShortCard
                  shortUrl={short?.shortUrl}
                  title={short?.title}
                  channelName={short?.channel?.name}
                  views={short?.views}
                  id={short?._id}
                  avatar={short?.channel?.avatar}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= SAVED VIDEOS ================= */}
      {savedVideo.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-6 pt-[50px] border-b border-gray-300 pb-2 flex items-center gap-2">
            <GoVideo className="w-7 h-7 text-red-600" />
            Saved Videos
          </h2>

          <div className="flex flex-wrap gap-6">
            {savedVideo.map((video) => (
              <div key={video?._id} className="flex-shrink-0">
                <VideoCard
                  thumbnail={video.thumbnail}
                  duration={duration[video._id] || "0:00"}
                  channelLogo={video.channel?.avatar}
                  title={video.title}
                  channelName={video.channel?.name}
                  views={video.views}
                  id={video._id}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SavedContent;
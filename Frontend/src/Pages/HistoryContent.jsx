import React, { useEffect, useState } from "react";

import { SiYoutubeshorts } from "react-icons/si";
import { GoVideo } from "react-icons/go";
import ShortCard from "../components/ShortCard";  
import VideoCard from "../components/VideoCard";
import { useSelector } from "react-redux";


const getVideoDuration = (url, callback) => {
  const video = document.createElement("video")

  video.preload = "metadata"
  video.src = url

  video.onloadedmetadata = () => {
    const totalSeconds = Math.floor(video.duration)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    callback(`${minutes}:${seconds.toString().padStart(2, "0")}`)
  }

  video.onerror = () => {
    callback("0:00")
  }
}

function HistoryContent() {
    const {videoHistory,shortHistory} = useSelector(state=>state.user)
    const [duration, setDuration] = useState("")
  
    useEffect(() => {
      if (Array.isArray(videoHistory) && videoHistory.length > 0) {
    videoHistory.forEach((v) => {
        const videos = v?.contentId
          getVideoDuration(videos?.videoUrl, (formattedTime) => {
            setDuration(prev => ({
              ...prev,
              [videos?._id]: formattedTime
            }))
          })
        })
      }
    }, [videoHistory])



 if((!videoHistory && !shortHistory) || (videoHistory.length === 0
  && shortHistory.length === 0)){
 
        return(
            <div className='flex justify-center items-center h-[70vh] text-gray-400
            text-xl'> No content Found</div>

            
        )
    }


  return (
    <div className="px-6 py-4 min-h-screen mt-[50px] lg:mt-[20px]">
      {shortHistory.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-6 pt-[50px] border-b 
          border-gray-300 pb-2 flex items-center gap-2">
            <SiYoutubeshorts className="w-7 h-7 text-red-600" />
            Shorts
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {shortHistory?.map((s) => {
                const short   = s?.contentId
                return (
              <div key={s?._id} className="flex-shrink-0">
                <ShortCard
                  shortUrl={short?.shortUrl}
                  title={short?.title}
                  channelName={short?.channel?.name}
                  views={short?.views}
                  id={short?._id}
                  avatar={short?.channel?.avatar}
                />
              </div>)
              })}
          </div>
        </>
      )}
      {videoHistory.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-6 pt-[50px] border-b 
          border-gray-300 pb-2 flex items-center gap-2">
            <GoVideo className="w-7 h-7 text-red-600" />
            Videos
          </h2>

          <div className="flex flex-wrap gap-6">
  {videoHistory?.map((v) => {
    const video = v?.contentId
    return(
    <div key={v?._id} className="flex-shrink-0">
      <VideoCard
        thumbnail={video?.thumbnail}
        duration={duration[video?._id] || "0:00"}
        channelLogo={video?.channel?.avatar}
        title={video?.title}
        channelName={video?.channel?.name}
        views={video?.views}
        id={video?._id}
      />
   
              </div>
            )})}
          </div>
        </>
      )}
    </div>
  );
}

export default HistoryContent;
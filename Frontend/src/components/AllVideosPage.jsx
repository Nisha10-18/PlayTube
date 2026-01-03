import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import VideoCard from './VideoCard'

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

function AllVideosPage() {
  const { allVideosData } = useSelector(state => state.content)
  const [duration, setDuration] = useState({})

  useEffect(() => {
    if (Array.isArray(allVideosData) && allVideosData.length > 0) {
      allVideosData.forEach((video) => {
        getVideoDuration(video.videoUrl, (formattedTime) => {
          setDuration(prev => ({
            ...prev,
            [video._id]: formattedTime
          }))
        })
      })
    }
  }, [allVideosData])

  return (
    <div className='flex flex-wrap gap-6 mb-12 md:justify-start sm:items-center sm:justify-center'>
      {
        allVideosData?.map((video) => (
          <VideoCard
            key={video?._id}
            duration={duration[video?._id] || "0:00"}
            thumbnail={video?.thumbnail}
            title={video?.title}
            channelLogo={video?.channel?.avatar}
            channelName={video?.channel?.name}
            id={video?._id}
            views={video?.views}

          />
        ))
      }
    </div>
  )
}

export default AllVideosPage
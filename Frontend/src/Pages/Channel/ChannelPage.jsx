import axios from "axios"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { serverUrl } from "../../App"
import { ClipLoader } from "react-spinners"
import VideoCard from "../../components/VideoCard"
import ShortCard from "../../components/ShortCard"
import PlaylistCard from "../../components/PlaylistCard"
import PostCard from "../../components/PostCard"

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

  video.onerror = () => callback("0:00")
}

function ChannelPage() {
  const { channelId } = useParams()
  const { allChannelData, userData } = useSelector((state) => state.user)

  const channelData = allChannelData?.find((c) => c._id === channelId)

  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("Videos")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [duration, setDuration] = useState({})

  /* 🔥 FIX 1: channel sync */
  useEffect(() => {
    if (channelData) setChannel(channelData)
  }, [channelData])

  /* video duration */
  useEffect(() => {
    if (!Array.isArray(channel?.videos)) return

    channel.videos.forEach((video) => {
      getVideoDuration(video.videoUrl, (formattedTime) => {
        setDuration((prev) => ({
          ...prev,
          [video._id]: formattedTime,
        }))
      })
    })
  }, [channel?.videos])

  /* 🔥 FIX 2: subscription check */
  useEffect(() => {
    if (!channel?.subscribers || !userData?._id) return

    const subscribed = channel.subscribers.some(
      (sub) =>
        sub?._id?.toString() === userData._id?.toString() ||
        sub?.toString() === userData._id?.toString()
    )
    setIsSubscribed(subscribed)
  }, [channel?.subscribers, userData?._id])

  const handleSubscribe = async () => {
    if (!channel?._id || loading) return
    setLoading(true)

    try {
      const result = await axios.post(
        serverUrl + "/api/user/togglesubscribe",
        { channelId: channel._id },
        { withCredentials: true }
      )

      setChannel((prev) => ({
        ...prev,
        subscribers: result.data.subscribers || prev.subscribers,
      }))
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  if (!channel) return null

  return (
    <div className="text-white min-h-screen pt-[100px]">
      {/* banner */}
      <div className="relative">
        <img src={channel.banner} className="w-full h-60 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* channel info */}
      <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-900 via-black to-gray-900">
        <img
          src={channel.avatar}
          className="w-28 h-28 rounded-full border-4 border-gray-800"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{channel.name}</h1>
          <p className="text-gray-400">
            <span className="text-white font-semibold">
              {channel.subscribers?.length}
            </span>{" "}
            Subscribers ·{" "}
            <span className="text-white font-semibold">
              {channel.videos?.length}
            </span>{" "}
            Videos
          </p>
          <p className="text-gray-300 text-sm mt-2">{channel.category}</p>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className={`px-5 py-2 rounded-full ${
            isSubscribed
              ? "bg-black text-white"
              : "bg-white text-black"
          } hover:bg-orange-600 hover:text-black`}
        >
          {loading ? (
            <ClipLoader size={20} color="black" />
          ) : isSubscribed ? (
            "Subscribed"
          ) : (
            "Subscribe"
          )}
        </button>
      </div>

      {/* tabs */}
      <div className="flex gap-8 px-6 border-b border-gray-800">
        {["Videos", "Shorts", "Playlists", "Community"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 ${
              activeTab === tab ? "text-white" : "text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* content */}
      <div className="px-6 py-6">
        {activeTab === "Videos" && (
          <div className="flex flex-wrap gap-5">
            {channel.videos?.map((v) => (
              <VideoCard
                key={v._id}
                id={v._id}
                thumbnail={v.thumbnail}
                duration={duration[v._id] || "0:00"}
                channelLogo={channel.avatar}
                title={v.title}
                channelName={channel.name}
                views={v.views}
              />
            ))}
          </div>
        )}

        {activeTab === "Shorts" && (
          <div className="flex gap-4 flex-wrap">
            {channel.shorts?.map((s) => (
              <ShortCard
                key={s._id}
                id={s._id}
                shortUrl={s.shortUrl}
                title={s.title}
                channelName={channel.name}
                views={s.views}
                avatar={channel.avatar}
              />
            ))}
          </div>
        )}

        {activeTab === "Playlists" && (
          <div className="flex gap-5 flex-wrap">
            {channel.playlists?.map((p) => (
              <PlaylistCard
                key={p._id}
                id={p._id}
                title={p.title}
                videos={p.videos}
                savedBy={p.savedBy}
              />
            ))}
          </div>
        )}

        {activeTab === "Community" && (
          <div className="flex gap-5 flex-wrap">
            {channel.communityPosts?.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChannelPage
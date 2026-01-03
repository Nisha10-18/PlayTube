import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaComment, FaThumbsUp } from "react-icons/fa"

function Dashboard() {
  const { channelData } = useSelector(state => state.user)
  const navigate = useNavigate()

  const totalVideoViews = (channelData?.videos || []).reduce(
    (acc, v) => acc + (v.views || 0),
    0
  )

  const totalShortViews = (channelData?.shorts || []).reduce(
    (acc, s) => acc + (s.views || 0),
    0
  )

  const totalViews = totalVideoViews + totalShortViews

  return (
    <div className="w-full text-white min-h-screen p-4 sm:p-6 space-y-6 mb-[50px]">

      {/* Channel Info */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        <img
          src={channelData?.avatar}
          alt=""
          className="w-16 h-16 rounded-full object-cover border border-gray-700"
        />
        <div className="text-center sm:text-left">
          <h2 className="text-lg sm:text-xl font-bold">
            {channelData?.name}
          </h2>
          <p className="text-sm text-gray-400">
            {channelData?.subscribers?.length || 0} Total Subscribers
          </p>
        </div>
      </div>

      {/* Analytics */}
      <div>
        <h3 className="pl-1 text-start sm:text-lg font-semibold mb-3">
          Channel Analytics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <AnalyticsCard
            label="Views"
            value={totalViews}
            onClick={() => navigate("/studio/analytics")}
          />
          <AnalyticsCard
            label="Subscribers"
            value={channelData?.subscribers?.length || 0}
          />
        </div>
      </div>

      {/* Latest Videos & Shorts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* Latest Videos */}
        <div>
          <h3 className="pl-1 text-start sm:text-lg font-semibold mb-3">
            Latest Videos
          </h3>

          <div className="space-y-4">
            {channelData?.videos
              ?.slice()
              .reverse()
              .slice(0, 5)
              .map((v, idx) => (
                <ContentCard
                  key={v?._id || idx}
                  content={v}
                  onClick={() => navigate(`/playvideo/${v?._id}`)}
                />
              ))}
          </div>
        </div>

        {/* Latest Shorts */}
        <div>
          <h3 className="pl-1 text-start sm:text-lg font-semibold mb-3">
            Latest Shorts
          </h3>

          <div className="space-y-4">
            {channelData?.shorts
              ?.slice()
              .reverse()
              .slice(0, 5)
              .map((s, idx) => (
                <ContentCard1
                  key={s?._id || idx}
                  content={s}
                  onClick={() => navigate(`/playshort/${s?._id}`)}
                />
              ))}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ================= Content Card ================= */
function ContentCard({ content, onClick }) {
  return (
    <div
      className="flex gap-4 items-start bg-[#0f0f0f] border border-gray-700
      rounded-lg p-3 hover:bg-[#202020] transition cursor-pointer"
      onClick={onClick}
    >
      <img
        src={content?.thumbnail || content?.shortThumbnail}
        alt=""
        className="w-24 h-16 object-cover rounded"
      />

      <div className="flex-1">
        <h4 className="font-semibold text-sm line-clamp-2">
          {content?.title}
        </h4>

        <p className="text-xs text-gray-400 mt-1">
          Published {new Date(content?.createdAt).toLocaleDateString()}
        </p>

        <div className="flex gap-4 mt-2 text-gray-300 text-sm">
          <span className="flex items-center gap-1">
            <FaEye /> {content?.views || 0}
          </span>
          <span className="flex items-center gap-1">
            <FaThumbsUp /> {content?.likes?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <FaComment /> {content?.comments?.length || 0}
          </span>
        </div>
      </div>
    </div>
  )
}


/* ================= Content Card ================= */
function ContentCard1({ content, onClick }) {
  return (
    <div
      className="flex gap-4 items-start bg-[#0f0f0f] border border-gray-700
      rounded-lg p-3 hover:bg-[#202020] transition cursor-pointer"
      onClick={onClick}
    >
      <video
        src={content?.shortUrl}
       
        className="w-20 h-24 object-cover"
        muted
        playsInline
        preload="metadata"
        onContextMenu={(e) => e.preventDefault()}
      />

      <div className="flex-1">
        <h4 className="font-semibold text-sm line-clamp-2">
          {content?.title}
        </h4>

        <p className="text-xs text-gray-400 mt-1">
          Published {new Date(content?.createdAt).toLocaleDateString()}
        </p>

        <div className="flex gap-4 mt-2 text-gray-300 text-sm">
          <span className="flex items-center gap-1">
            <FaEye /> {content?.views || 0}
          </span>
          <span className="flex items-center gap-1">
            <FaThumbsUp /> {content?.likes?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <FaComment /> {content?.comments?.length || 0}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ================= Analytics Card ================= */
function AnalyticsCard({ label, value, onClick }) {
  return (
    <div
      className="bg-[#0f0f0f] border border-gray-700 rounded-lg
      p-3 hover:shadow-lg transition cursor-pointer"
      onClick={onClick}
    >
      <p className="text-gray-400 text-sm">{label}</p>
      <h4 className="text-lg font-bold">{value}</h4>
    </div>
  )
}

export default Dashboard
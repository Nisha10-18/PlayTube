import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { serverUrl } from "../../App";

import {
  FaPlay,
  FaComment,
  FaPause,
  FaThumbsUp,
  FaThumbsDown,
  FaDownload,
  FaBookmark,
  FaArrowDown,
} from "react-icons/fa";
import Description from "../../components/Description";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const IconButton = ({ icon: Icon, active, label, count, onClick }) => (
  <button className="flex flex-col items-center" onClick={onClick}>
    <div
      className={`${
        active ? "bg-white" : "bg-[#00000065] border border-gray-700"
      } p-3 rounded-full hover:bg-gray-700 transition`}
    >
      <Icon size={20} className={`${active ? "text-black" : "text-white"}`} />
    </div>
    <span className="text-xs mt-1 flex gap-1">
      {count !== undefined && `${count}`} <span>{label}</span>
    </span>
  </button>
);

function Shorts() {
  const { allShortsData } = useSelector((state) => state.content);
  const { userData } = useSelector((state) => state.user);
  const [shortList, setShortList] = useState([]);
  const shortRefs = useRef([]);
  const [playindex, setPlayIndex] = useState(null);
  const [openComment, setOpenComment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewedShort, setViewedShort] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [reply, setReply] = useState(null);
  const [replyText, setReplyText] = useState({});
  const navigate = useNavigate()
  const [activeIndex,setActiveIndex] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index);
          const video = shortRefs.current[index];
          if (video) {
            if (entry.isIntersecting) {
              video.muted = false;
              video.play();
              setActiveIndex(index)

              const currentShortId = shortList[index]._id;
              if (!viewedShort.includes(currentShortId)) {
                handleAddview(currentShortId);
                setViewedShort((prev) => [...prev, currentShortId]);
              }
            } else {
              video.muted = true;
              video.pause();
            }
          }
        });
      },
      { threshold: 0.7 }
    );

    shortRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [shortList]);

  const togglePlay = (index) => {
    const video = shortRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlayIndex(null);
    } else {
      video.pause();
      setPlayIndex(index);
    }
  };

  const handleSubscribe = async (channelId) => {
    if (!channelId) return;
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/togglesubscribe`,
        { channelId },
        { withCredentials: true }
      );

      setLoading(false);

      const isSubscribed = result.data.isSubscribed;
      const updatedSubscribers = result.data.subscribers;

      // Update only the subscribers array, keep rest of channel intact
      setShortList((prev) =>
        prev.map((short) =>
          short?.channel?._id === channelId
            ? {
                ...short,
                channel: { ...short.channel, subscribers: updatedSubscribers,
                  isSubscribed:isSubscribed,
                 },
              }
            : short
        )
      );
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleAddview = async (shortId) => {
    try {
      await axios.put(
        `${serverUrl}/api/content/short/${shortId}/add-view`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const toggleLike = async (shortId) => {
    try {
      const result = await axios.put(
        `${serverUrl}/api/content/short/${shortId}/toggle-like`,
        {},
        { withCredentials: true }
      );
      const updatedShort = result.data;
      setShortList((prev) =>
        prev.map((short) =>
          short?._id === updatedShort._id ? updatedShort : short
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const toggleDisLike = async (shortId) => {
    try {
      const result = await axios.put(
        `${serverUrl}/api/content/short/${shortId}/toggle-dislike`,
        {},
        { withCredentials: true }
      );
      const updatedShort = result.data;
      setShortList((prev) =>
        prev.map((short) =>
          short?._id === updatedShort._id ? updatedShort : short
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const toggleSave = async (shortId) => {
    console.log("SAVE CLICKED ID:", shortId);

    try {
      const res = await axios.put(
        `${serverUrl}/api/content/short/${shortId}/toggle-save`,
        {},
        { withCredentials: true }
      );

      console.log("UPDATED SHORT:", res.data);

      setShortList((prev) =>
        prev.map((s) => (s._id === res.data._id ? res.data : s))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddComment = async (shortId) => {
    if (!newComment) return;

    try {
      const result = await axios.post(
        `${serverUrl}/api/content/short/${shortId}/add-comment`,
        { message: newComment },
        { withCredentials: true }
      );

      setComments((prev) => ({
        ...prev,
        [shortId]: result.data.comments || [],
      }));

      console.log(result.data?.comments);
      setNewComment("");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleAddReply = async ({ commentId, replyText, shortId }) => {
    if (!replyText) return;

    try {
      const result = await axios.post(
        `${serverUrl}/api/content/short/${shortId}/comment/${commentId}/add-reply`,
        { message: replyText },
        { withCredentials: true }
      );

      setComments((prev) => ({
        ...prev,
        [shortId]: result.data.comments || [],
      }));

      setReplyText((prev) => ({
        ...prev,
        [commentId]: "",
      }));

      console.log(result.data?.comments);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!allShortsData || allShortsData.length === 0) return;
    const shuffled = [...allShortsData].sort(() => Math.random() - 0.5);
    setShortList(shuffled);
  }, [allShortsData]);


   
  
  useEffect(() => {
    const addHistory = async () => {
      try {
         const shortId = shortList[activeIndex]?._id
         console.log(shortId)
         if(!shortId)return;
        const res = await axios.post(
          `${serverUrl}/api/user/add-history`,
          {
            contentId: shortId,
            contentType: "Short",
          },
          { withCredentials: true }
        );
  
        console.log(res.data);
      } catch (err) {
        console.error("Error adding history:", err);
      }
    };
  
    if (shortList.length > 0)  addHistory();
     
    
  }, [activeIndex,shortList]);

  return (
    <div className="h-[100vh] w-full overflow-y-scroll snap-y snap-mandatory">
      {shortList.map((short, index) => (
        <div
          key={short?._id }
          className="min-h-screen w-full flex md:items-center items-start 
         justify-center snap-start pt-[40px] md:pt-[0px]"
        >
          <div
            className="relative w-[420px] md:w-[350px] aspect-[9/16] bg-black rounded-2xl overflow-hidden  mt-[120px] md:mt-[0px]  shadow-xl border border-gray-700 cursor-pointer"
            onClick={() => togglePlay(index)}
          >
            <video
              loop
              playsInline
              ref={(el) => (shortRefs.current[index] = el)}
              data-index={index}
              src={short?.shortUrl}
              className="w-full h-full object-cover"
            />

            <div className="absolute top-3 right-3 bg-black/60 rounded-full p-2">
              {playindex === index ? (
                <FaPlay className="text-white text-lg" />
              ) : (
                <FaPause className="text-white text-lg" />
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white space-y-1">
              <div className="flex items-center gap-2">
                <img
                  src={short?.channel?.avatar}
                  className="w-8 h-8 rounded-full border border-gray-700"
                  alt="" onClick={()=>navigate(`/channelpage/${short?.channel?._id}`)}
                />
                <span className="text-sm text-gray-300"
                onClick={()=>navigate(`/channelpage/${short?.channel?._id}`)}>
                  @{short?.channel?.name?.toLowerCase()}
                </span>

                <button
                  className={`${
                    short?.channel?.subscribers?.includes(userData?._id)
                      ? "bg-[#000000a1] text-white border border-gray-700"
                      : "bg-white text-black"
                  } text-xs px-[20px] py-[10px] rounded-full cursor-pointer`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubscribe(short?.channel?._id);
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <ClipLoader size={20} color="gray" />
                  ) : short?.channel?.subscribers?.includes(userData?._id) ? (
                    "Subscribed"
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>

              <h3 className="font-bold text-lg line-clamp-2">{short?.title}</h3>

              {short?.tags?.map((tag, i) => (
                <span
                  key={i}
                  className="bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded-full mr-1"
                >
                  {tag}
                </span>
              ))}
            </div>

            <Description text={short?.description} />

            <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 text-white">
              <IconButton
                icon={FaThumbsUp}
                label={"Likes"}
                active={short?.likes?.includes(userData?._id)}
                count={short?.likes?.length}
                onClick={() => toggleLike(short?._id)}
              />
              <IconButton
                icon={FaThumbsDown}
                label={"Dislikes"}
                active={short?.dislikes?.includes(userData?._id)}
                count={short?.dislikes?.length}
                onClick={() => toggleDisLike(short?._id)}
              />
              <IconButton
                icon={FaComment}
                label={"Comment"}
                onClick={() => {
                  setOpenComment(!openComment);
                  setComments((prev) => ({
                    ...prev,
                    [short._id]: short.comments,
                  }));
                }}
              />
              <IconButton
                icon={FaDownload}
                label={"Download"}
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = short?.shortUrl;
                  link.download = `${short?.title}.mp4`;
                  link.click();
                }}
              />

              <IconButton
                icon={FaBookmark}
                label="Save"
                active={short?.savedBy?.some(
                  (id) => id.toString() === userData?._id
                )}
                onClick={() => toggleSave(short?._id)}
              />
            </div>

            {openComment && (
              <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-black/95 text-white p-4 rounded-t-2xl overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">Comments</h3>
                  <FaArrowDown
                    size={20}
                    onClick={() => setOpenComment(!openCamera)}
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a Comment..."
                    className="flex-1 bg-gray-900 text-white p-2 rounded"
                    onChange={(e) => setNewComment(e.target.value)}
                    value={newComment}
                  />
                  <button
                    className="bg-black px-4 py-2 border-1 border-gray-700 rounded-xl"
                    onClick={() => handleAddComment(short?._id)}
                  >
                    Post
                  </button>
                </div>
                <div className="space-y-3 mt-4">
                  {comments[short._id]?.length > 0 ? (
                    comments[short._id].map((comment) => (
                      <div
                        key={comment?._id}
                        className="bg-gray-800/40 p-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={comment?.author?.photoUrl}
                            alt=""
                            className="w-6 h-6 rounded-full"
                          />
                          <h3 className="text-sm font-semibold">
                            {comment?.author?.userName}
                          </h3>
                        </div>

                        <p className="text-sm ml-8">{comment?.message}</p>

                        <button
                          className="text-md text-orange-500 ml-8 mt-2"
                          onClick={() => setReply(!reply)}
                        >
                          reply
                        </button>

                        {reply && (
                          <div className="mt-2 ml-8 flex gap-2">
                            <input
                              type="text"
                              className="w-full bg-gray-900 text-white text-sm p-2 rounded"
                              placeholder="Add a reply..."
                              onChange={(e) =>
                                setReplyText((prev) => ({
                                  ...prev,
                                  [comment._id]: e.target.value,
                                }))
                              }
                              value={replyText[comment._id] || ""}
                            />
                            <button
                              className=" bg-orange-500 px-3 py-1 rounded text-xs"
                              onClick={() => {
                                handleAddReply({
                                  shortId: short._id,
                                  commentId: comment._id,
                                  replyText: replyText[comment._id],
                                });
                                setReplyText((prev) => ({
                                  ...prev,
                                  [comment._id]: "",
                                }));
                              }}
                            >
                              Reply
                            </button>
                          </div>
                        )}

                        <div className="ml-5 mt-2 space-y-2">
                          {comment?.replies?.map((reply) => (
                            <div
                              key={reply?._id}
                              className="bg-gray-800/40 p-2 rounded-lg"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <img
                                  src={reply?.author?.photoUrl}
                                  alt=""
                                  className="w-6 h-6 rounded-full"
                                />
                                <h3 className="text-sm font-semibold">
                                  {reply?.author?.userName}
                                </h3>
                              </div>
                              <p className="text-sm ml-8">{reply?.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No comments yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Shorts;
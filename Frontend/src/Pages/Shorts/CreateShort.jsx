import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { showCustomAlert } from "../../components/CustomAlert";
import { serverUrl } from "../../App";
import { setAllShortsData } from "../../redux/contentSlice";
import { setChannelData } from "../../redux/userSlice";

function CreateShort() {
  const [shortUrl, setShortUrl] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const {allShortsData} = useSelector(state=>state.content)
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { channelData } = useSelector(state=>state.user);

  const handleUploadShort = async () => {
    if (!shortUrl) {
      showCustomAlert("Please upload a short video");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append(
      "tags",
      JSON.stringify(tags.split(",").map((tag) => tag.trim())));
    formData.append("shortUrl", shortUrl);
    formData.append("channelId", channelData?._id);

    try {
      const result = await axios.post(
        serverUrl + "/api/content/create-short",
        formData,
        { withCredentials: true }
      );
       console.log(result.data);
      showCustomAlert("Short created successfully");
      navigate("/");
      setLoading(false);
     
      dispatch(setAllShortsData([...allShortsData,result.data]))
      const updateChannel = {
        ...channelData , videos : [...(channelData.videos || []),result.data]

      }  
     
     dispatch(setChannelData(updateChannel))
    } catch (error) {
      console.log(error);
      showCustomAlert(error.response?.data?.message || "Upload failed");
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] bg-[#0f0f0f] text-white flex flex-col pt-5">
      <main className="flex flex-1 justify-center items-center px-4 py-6">
        <div className="bg-[#212121] p-6 rounded-xl w-full max-w-3xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT */}
          <div className="flex justify-center items-start">
            <label
              htmlFor="short"
              className="flex flex-col items-center justify-center border-2 border-dashed
               hover:border-orange-400 border-gray-500 rounded-lg cursor-pointer 
              bg-[#181818] overflow-hidden w-[220px] aspect-[9/16]"
            >
              {shortUrl ? (
                <video
                  src={URL.createObjectURL(shortUrl)}
                  className="h-full w-full object-cover"
                  controls
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1">
                  <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
                  <p className="text-gray-300 text-xs text-center px-2">
                    Click to upload Short video
                  </p>
                  <span className="text-[10px] text-gray-500">
                    MP4 or MOV · MAX 60s
                  </span>
                </div>
              )}

              <input
                type="file"
                id="short"
                className="hidden"
                accept="video/mp4,video/quicktime"
                onChange={(e) => setShortUrl(e.target.files[0])}
              />
            </label>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#121212] border border-gray-700
              text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#121212] border border-gray-700
              text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />

            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={(e)=>setTags(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#121212] border border-gray-700
              text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />

            <button
              disabled={!title || !description || !tags || loading}
              onClick={handleUploadShort}
              className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-medium 
              disabled:bg-gray-600 flex items-center justify-center"
            >
              {loading ? <ClipLoader color="black" size={20} /> : "Upload Short"}
            </button>

            {loading && (
              <p className="text-center text-gray-300 text-sm animate-pulse">
                Short uploading... please wait...
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateShort;
import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { showCustomAlert } from "../../components/CustomAlert";
import { serverUrl } from "../../App";
import { setAllShortsData } from "../../redux/contentSlice";
import { setChannelData } from "../../redux/userSlice";
import { useEffect } from "react";

function UpdateShort() {
  const { shortId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const { allShortsData } = useSelector((state) => state.content);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { channelData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!shortId) return;

    const fetchShort = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${serverUrl}/api/content/fetchshort/${shortId}`,
          { withCredentials: true }
        );

        setTitle(res.data.title);
        setDescription(res.data.description);
        setTags(res.data.tags?.join(", ") || "");
      } catch (error) {
        console.error(error);
        showCustomAlert("Failed to load short", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchShort();
  }, [shortId]);

  const handleUpdate = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/content/updateshort/${shortId}`,
        {
          title,
          description,
          tags: JSON.stringify(
            tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          ),
        },
        { withCredentials: true }
      );

      const updatedShort = res.data;

      // ✅ Update allShortsData in Redux
      const updatedAllShorts = allShortsData.map((s) =>
        s._id === shortId ? updatedShort : s
      );
      dispatch(setAllShortsData(updatedAllShorts));
      setLoading(false);
      // ✅ Update channelData in Redux
      const updatedChannel = {
        ...channelData,
        shorts: channelData.shorts.map((s) =>
          s._id === shortId ? updatedShort : s
        ),
      };
      dispatch(setChannelData(updatedChannel));

      showCustomAlert("Short updated successfully", "success");
    } catch (error) {
      console.error(error);
      showCustomAlert("Failed to update short", "error");
      setLoading(false);
    }
  };

  //handle delete
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this short?")) return;
    setLoading(true);

    try {
      await axios.delete(`${serverUrl}/api/content/deleteshort/${shortId}`, {
        withCredentials: true,
      });

      // ✅ Update allShortsData in Redux
      const updatedAllShorts = allShortsData.filter((s) => s._id !== shortId);
      dispatch(setAllShortsData(updatedAllShorts));

      // ✅ Update channelData in Redux
      const updatedChannel = {
        ...channelData,
        shorts: channelData.shorts.filter((s) => s._id !== shortId),
      };
      dispatch(setChannelData(updatedChannel));
      showCustomAlert("Short deleted successfully", "success");
      setLoading(false);
      navigate("/ptstudio/content");
    } catch (error) {
      console.error(error);
      showCustomAlert("Failed to delete short", "error");
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] bg-[#0f0f0f] text-white flex flex-col pt-5">
      <main className="flex flex-1 justify-center items-center px-4 py-6">
        <div
          className="bg-[#212121] p-6 rounded-xl w-full max-w-2xl shadow-lg
        flex flex-col items-center justify-center gap-6"
        >
          <div className="flex flex-col space-y-4 w-full">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#121212] border border-gray-700
              text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#121212] border border-gray-700
              text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />

            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#121212] border border-gray-700
              text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />

            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium 
              disabled:bg-gray-600 flex items-center justify-center"
              onClick={handleUpdate}
            >
              {loading ? (
                <ClipLoader color="black" size={20} />
              ) : (
                "Update Short"
              )}
            </button>
            <button
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-medium 
              disabled:bg-gray-600 flex items-center justify-center"
              onClick={handleDelete}
            >
              {loading ? (
                <ClipLoader color="black" size={20} />
              ) : (
                "Delete Short"
              )}
            </button>

            {loading && (
              <p className="text-center text-gray-300 text-sm animate-pulse">
                Short Updating... please wait...
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default UpdateShort;

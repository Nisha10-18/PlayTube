import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { ClipLoader } from 'react-spinners'
import { showCustomAlert } from '../../components/CustomAlert'
import { serverUrl } from '../../App'
import { setAllVideosData } from '../../redux/contentSlice'
import { setChannelData } from '../../redux/userSlice'

function UpdateVideo() {
  const { videoId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { channelData } = useSelector(state => state.user)
  const { allVideosData } = useSelector(state => state.content)


  const [video, setVideo] = useState(null)

  const [thumbnail, setThumbnail] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(false)

  const handleThumbnail = (e) => {
    setThumbnail(e.target.files[0])
  }

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/content/fetchvideo/${videoId}`,
          { withCredentials: true }
        )

        setVideo(res.data)                 // ✅ now works
        setTitle(res.data.title)
        setDescription(res.data.description || "")
        setTags(res.data.tags.join(","))

      } catch (error) {
        showCustomAlert(
          error.response?.data?.message || "Failed to load video"
        )
        navigate("/")
      }
    }

    fetchVideo()
  }, [videoId, navigate])

  const handleUpdate = async () => {
  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append(
      "tags",
      JSON.stringify(tags.split(",").map((t) => t.trim()))
    );

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    const result = await axios.post(
      `${serverUrl}/api/content/updatevideo/${videoId}`,
      formData,
      { withCredentials: true }
    );

    // update redux
    const updatedVideos = allVideosData.map((v) =>
      v._id === videoId ? result.data.video : v
    );

    dispatch(setAllVideosData(updatedVideos));
    showCustomAlert("Video uploaded successfully");
  } catch (error) {
   showCustomAlert(error.response?.data?.message || "updated failed");
  } 
    setLoading(false);
  
};

//Delete Video

const handleDelete = async () => {
  if (!window.confirm("Are you sure you want to delete this video?")) return;

  try {
    setLoading(true);

    await axios.delete(
      `${serverUrl}/api/content/deletevideo/${videoId}`,
      { withCredentials: true }
    );

    // remove from redux
    dispatch(
      setAllVideosData(allVideosData.filter((v) => v._id !== videoId)));

    showCustomAlert("Video deleted successfully");
    navigate("/");
  } catch (error) {
    showCustomAlert(
      error.response?.data?.message || "Delete failed"
    );
  } 
    setLoading(false);
  }



  return (
    <div className='w-full min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center flex-col pt-5'>
      <div className='flex flex-1 justify-center items-center px-4 py-6'>
        <div className='bg-[#212121] p-6 rounded-xl w-full max-w-2xl shadow-lg space-y-6'>

          <input
            type='text'
            placeholder='Title*'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full p-3 rounded-lg bg-[#212121] border border-gray-700'
          />

          <textarea
            placeholder='Description*'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='w-full p-3 rounded-lg bg-[#212121] border border-gray-700'
          />

          <input
            type='text'
            placeholder='Tags (comma separated)*'
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className='w-full p-3 rounded-lg bg-[#212121] border border-gray-700'
          />

          <label className='cursor-pointer'>
            {thumbnail ? (
              <img
                src={URL.createObjectURL(thumbnail)}
                className='w-full h-40 object-cover rounded-lg'
                alt='thumbnail'
              />
            ) : (
              <div className='w-full h-32 bg-gray-700 flex items-center justify-center rounded-lg'>
                Upload Thumbnail
              </div>
            )}

            <input
              type='file'
              accept='image/*'
              onChange={handleThumbnail}
              className='hidden'
            />
          </label>

          <button
            className='w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium disabled:bg-gray-600 flex items-center justify-center'
            disabled={loading} onClick={handleUpdate}
          >
            {loading ? <ClipLoader color='black' size={20} /> : "Update Video"}
          </button>

          {loading && (
            <p className='text-center text-gray-300 text-sm animate-pulse'>
              Video Updating... please wait...
            </p>
          )}

          <button
            className='w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-medium disabled:bg-gray-600 flex items-center justify-center'
            disabled={loading} onClick={handleDelete}
          >
            {loading ? <ClipLoader color='black' size={20} /> : "Delete Video"}
          </button>

        </div>
      </div>
    </div>
  )
}

export default UpdateVideo
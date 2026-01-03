import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { ClipLoader } from 'react-spinners'
import { showCustomAlert } from '../../components/CustomAlert'
import { serverUrl } from '../../App'
import { setAllVideosData } from '../../redux/contentSlice'
import { setChannelData } from '../../redux/userSlice'

function CreateVideo() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { channelData } = useSelector(state => state.user)
  const { allVideosData } = useSelector(state => state.content)
  const [videoUrl, setVideoUrl] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVideo = (e) => {
    setVideoUrl(e.target.files[0])
  }

  const handleThumbnail = (e) => {
    setThumbnail(e.target.files[0])
  }

  const handleUploadVideo = async () => {
    if (!videoUrl || !thumbnail) {
      showCustomAlert("Video & Thumbnail required")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append(
      "tags",
      JSON.stringify(tags.split(",").map(tag => tag.trim()))
    )
    formData.append("video", videoUrl)
    formData.append("thumbnail", thumbnail)
    formData.append("channelId", channelData._id)

    try {
      const result = await axios.post(
        serverUrl + "/api/content/create-video",
        formData,
        { withCredentials: true }
      )

      showCustomAlert("Upload Video Successfully")

      dispatch(setAllVideosData([...allVideosData, result.data]))

      const updateChannel = {
        ...channelData,
        videos: [...(channelData.videos || []), result.data]
      }

      dispatch(setChannelData(updateChannel))

      navigate("/")
    } catch (error) {
      showCustomAlert(error.response?.data?.message || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center flex-col pt-5'>
      <div className='flex flex-1 justify-center items-center px-4 py-6'>
        <div className='bg-[#212121] p-6 rounded-xl w-full max-w-2xl shadow-lg space-y-6'>

          <input
            type='file'
            accept='video/*'
            onChange={handleVideo}
            className='w-full p-3 rounded-lg bg-[#212121] border border-gray-700'
          />

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
                alt="thumbnail"
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
            disabled={loading || !title || !description || !tags}
            onClick={handleUploadVideo}
            className='w-full bg-orange-600 py-3 rounded-lg flex justify-center'
          >
            {loading ? <ClipLoader size={20} /> : "Upload Video"}
          </button>

        </div>
      </div>
    </div>
  )
}

export default CreateVideo
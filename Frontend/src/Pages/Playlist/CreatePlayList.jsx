import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showCustomAlert } from '../../components/CustomAlert'
import axios from 'axios'
import GetChannelData from '../../customHooks/GetChannelData'
import { serverUrl } from '../../App'
import { useNavigate } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { setChannelData } from '../../redux/userSlice'

function CreatePlayList() {
  const[title,setTitle] = useState("")
  const[description,setDescription] = useState("")
  const {channelData} = useSelector(state=>state.user)
  const [videoData,setVideoData] = useState([])
  const [selectedVideos,setSelectedVideos] = useState([])
  const [loading,setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const toggleVideoSelect = (videoId) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId)
      ? prev.filter((id) => id !== videoId)
      : [...prev,videoId]
    );
  };

const handleCreatePlaylist = async () => {

  if(selectedVideos.length === 0){
    showCustomAlert("Please select at least one video")
  }
  setLoading(true)
  try {
    const result = await axios.post(serverUrl + "/api/content/create-playlist",{
      title,
      description,
      channelId:channelData._id,
      videoIds:selectedVideos
    }, {withCredentials:true})
    const updateChannel = {
            ...channelData,
            playlists: [...(channelData.playlists || []), result.data]
          }
    
          dispatch(setChannelData(updateChannel))
          console.log(result.data)
          showCustomAlert("Playlist Created")
          navigate("/")
          setLoading(false)
    
  } catch (error) {
    console.log(error)
    setLoading(false)
    showCustomAlert("Create Playlist error")
    
  }
}
  

  useEffect(()=> {
    if(channelData || channelData?.videos){
      setVideoData(channelData?.videos)
      console.log(videoData)
    }

  },[])
  return (
    <div className='w-full min-h-[80vh] bg-[#0f0f0f] text-white flex flex-col
    pt-5'>
   <main className='flex flex-1 justify-center items-center px-4 py-6'>
    <div className='bg-[#212121] p-6 rounded-xl w-full max-w-2xl shadow-lg space-y-6'>
      <input type="text" className='w-full p-3 rounded-lg bg-[#121212] border border-gray-700 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none'
      placeholder='Playlist Title *' onChange={(e)=>setTitle(e.target.value)} value={title}  />
  
     <textarea className='w-full p-3 rounded-lg bg-[#121212] border border-gray-700 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none'
      placeholder='Playlist Description *' onChange={(e)=>setDescription(e.target.value)} value={description}  />

      <div>
      <p className='mb-3 text-lg font-semibold'>Select Videos</p>

      {videoData?.length === 0 ? (
        <p className='text-sm text-gray-400'>
         No videos found for this channel
        </p>)
        :(
          <div className='grid grid-cols-2 gap-4 max-h-72 overflow-y-auto'>
             {videoData?.map((video)=>(
              <div key={video._id} className={`cursor-pointer rounded-lg
              overflow-hidden border-2 ${
              selectedVideos.includes(video._id)
              ? "border-orange-500"
              : "boder-gray-700"
              }`} onClick={()=>toggleVideoSelect(video?._id)}>

              <img src={video?.thumbnail} alt="" className='w-full h-28
              object-cover' />

              <p className='p-2 text-sm truncate'>
                {video?.title}
              </p>
              </div>))}
          </div>)}
          </div>
          <button  disabled={!title || !description || loading} className='w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-medium disabled:bg-gray-600 flex items-center justify-center'
          onClick={handleCreatePlaylist}>{loading?<ClipLoader size={20} color='black'/>:"Create Playlist"}</button>
    
</div>
   </main>
      
    </div>
  )
}

export default CreatePlayList
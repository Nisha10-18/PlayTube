import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showCustomAlert } from '../../components/CustomAlert'
import axios from 'axios'
import GetChannelData from '../../customHooks/GetChannelData'
import { serverUrl } from '../../App'
import { useNavigate, useParams } from 'react-router-dom'
import { ClipLoader } from 'react-spinners'
import { setChannelData } from '../../redux/userSlice'


function UpdatePlayList() {
    const {playlistId} = useParams()
  const[title,setTitle] = useState("")
  const[description,setDescription] = useState("")
  const {channelData} = useSelector(state=>state.user)
  const [videoData,setVideoData] = useState([])
  const [selectedVideos,setSelectedVideos] = useState([])
  const [loading,setLoading] = useState(false)
  const [playlist,setPlaylist] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

 useEffect(() => {
  const fetchPlaylist = async () => {
    try {
      const res = await axios.get(
        `${serverUrl}/api/content/fetchplaylist/${playlistId}`,
        { withCredentials: true }
      );

      setPlaylist(res.data);
      setTitle(res.data.title);
      setDescription(res.data.description);
      setSelectedVideos(
        res.data.videos.map((v) => v._id));
    } catch (error) {
        console.log(error);
      showCustomAlert("Failed to load playlist");
    } 
  };

  fetchPlaylist();
}, [playlistId]);

const toggleVideoSelect = (videoId) => {
    setSelectedVideos((prev) =>
        prev.includes(videoId)
    ? prev.filter((id) => id !== videoId)
    : [...prev,videoId]
    );
};

const handleUpdate = async () => {
  setLoading(true);

  try {
    // old playlist videos
    const currentVideos = playlist.videos.map((v) => v._id.toString());

    // newly selected videos
    const newVideos = selectedVideos.map((v) => v.toString());

    // videos to add
    const addVideos = newVideos.filter(
      (id) => !currentVideos.includes(id)
    );

    // videos to remove
    const removeVideos = currentVideos.filter(
      (id) => !newVideos.includes(id)
    );

   const res =  await axios.post(
      `${serverUrl}/api/content/updateplaylist/${playlistId}`,
      {
        title,
        description,
        addVideos,
        removeVideos,
      },
      
       { withCredentials: true}
      
    );
// Update Redux channel Data
const updatedPlaylists = channelData.playlists.map((p) =>
  p._id === playlistId ? res.data.playlist : p
);

dispatch(
  setChannelData({
    ...channelData,
    playlists: updatedPlaylists,
  })
);


showCustomAlert("Playlist updated successfully");

  } catch (error) {
  console.error(error);
  showCustomAlert(
    error.response?.data?.message || "Failed to update playlist"
  );
} 

setLoading(false);
}

// Delete Playlist

const handleDelete = async () => {
  if (!window.confirm("Are you sure you want to delete this playlist?")) return;

  setLoading(true);

  try {
    await axios.delete(
      `${serverUrl}/api/content/deleteplaylist/${playlistId}`,
      { withCredentials: true }
    );

    // Remove playlist from Redux
    const updatedPlaylists = channelData.playlists.filter(
      (p) => p._id !== playlistId
    );

    dispatch(
      setChannelData({
        ...channelData,
        playlists: updatedPlaylists,
      })
    );

    showCustomAlert("Playlist deleted successfully");
    navigate("/");
  } catch (error) {
    console.error(error);
    showCustomAlert(
      error.response?.data?.message || "Failed to delete playlist"
    );
  } 
    setLoading(false);
  
};

useEffect(()=>{
    if(channelData || channelData?.videos){
        setVideoData(channelData?.videos)
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
          <button  disabled={loading} className='w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium disabled:bg-gray-600 flex items-center justify-center'
          onClick={handleUpdate}
          >{loading?<ClipLoader size={20} color='black'/>:"Update Playlist"}</button>

           <button  disabled={loading} className='w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-medium disabled:bg-gray-600 flex items-center justify-center'
            onClick={handleDelete}
          >{loading?<ClipLoader size={20} color='black'/>:"Delete Playlist"}</button>
    
</div>
   </main>
      
    </div>
  )
}

export default UpdatePlayList

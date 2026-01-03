import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { serverUrl} from '../../App'
import axios from 'axios'
import {
 FaList
 } from "react-icons/fa";
import PlaylistCard from '../../components/PlaylistCard'

function SavedPlaylist() {
    const[savedPlaylist,setSavedPlaylist] = useState([])

    useEffect(()=>{
        const fetchSavedPlaylist = async () => {
            try {
                const result = await axios.get(serverUrl + "/api/content/savedplaylist",{withCredentials:true})
                setSavedPlaylist(result.data)
                console.log(result.data)
                
            } catch (error) {
                console.log(error)
                
            }
        }
        fetchSavedPlaylist()
    },[])

    if(!savedPlaylist || savedPlaylist.length === 0){
        return(
            <div className='flex justify-center items-center h-[70vh] text-gray-400
            text-xl'>No Saved Playlist Found</div>

            
        )
    }
  return (
    <div className='p-6 min-h-screen bg-black text-white mt-[40px] lg:mt-[20px]'>
     <h2 className="text-2xl font-bold mb-6 pt-[50px] border-b 
              border-gray-300 pb-2 flex items-center gap-2">
                <FaList className="w-7 h-7 text-orange-600" />
               Saved Playlist</h2>
               <div className='flex flex-wrap gap-6'>
                {savedPlaylist?.map((pl)=>(
                  <PlaylistCard 
                  key={pl._id}
                  id={pl._id}
                  title={pl.title}
                  videos={pl.videos}
                  savedBy={pl.saveBy}
                  />

                ))}
               </div>
      
    </div>
  )
}

export default SavedPlaylist;
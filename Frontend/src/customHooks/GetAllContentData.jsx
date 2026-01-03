import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { serverUrl } from '../App'
import { setAllShortsData, setAllVideosData } from '../redux/contentSlice'

const GetAllContentData = () => {
  const dispatch = useDispatch()
  const {channelData} = useSelector(state=>state.user)
    
  
    useEffect(() => {
      const fetchAllVideos = async () => {
        try {
          const result = await axios.get(
            serverUrl + "/api/content/getallvideos",
            { withCredentials: true }
          )
          dispatch(setAllVideosData(result.data))
          console.log(result.data)
        } catch (error) {
          console.log(error)
          dispatch(setAllVideosData(null))
        }
      }
  
      fetchAllVideos()
    }, [channelData])

    useEffect(() => {
      const fetchAllShorts = async () => {
        try {
          const result = await axios.get(
            serverUrl + "/api/content/getallshorts",
            { withCredentials: true }
          )
          dispatch(setAllShortsData(result.data))
          console.log(result.data)
        } catch (error) {
          console.log(error)
          dispatch(setAllShortsData(null))
        }
      }
  
      fetchAllShorts()
    }, [channelData])
}

export default GetAllContentData
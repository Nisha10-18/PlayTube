import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { serverUrl } from '../App'
import { setRecommendedContent } from '../redux/userSlice'

const GetRecommendedContent = () => {
const dispatch = useDispatch()
  

  useEffect(() => {
    const fetchRecommendedContent = async () => {
      try {
        const result = await axios.get(
          serverUrl + "/api/user/recommendation",
          { withCredentials: true })
          dispatch(setRecommendedContent(result.data))
          console.log(result.data)
      
      } catch (error) {
        console.log(error)
        dispatch(setRecommendedContent(null))
      }
    }

    fetchRecommendedContent()
  }, [])
}

export default GetRecommendedContent

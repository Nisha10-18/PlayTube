import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { serverUrl } from "../App"
import { setAllChannelData, setChannelData } from "../redux/userSlice"

const useGetChannelData = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const result = await axios.get(
          serverUrl + "/api/user/getchannel",
          { withCredentials: true }
        )
        dispatch(setChannelData(result.data))
        console.log("getchannel:", result.data)
      } catch (error) {
        console.log("getchannel error:", error.response?.data)
        dispatch(setChannelData(null))
      }
    }

    fetchChannel()
  }, [dispatch])

  useEffect(() => {
    const fetchAllChannel = async () => {
      try {
        const result = await axios.get(
          serverUrl + "/api/user/allchannel",
          { withCredentials: true }
        )
        dispatch(setAllChannelData(result.data))
        console.log("allchannel:", result.data)
      } catch (error) {
        console.log("allchannel error:", error.response?.data)
        dispatch(setAllChannelData(null))
      }
    }

    fetchAllChannel()
  }, [dispatch])
}

export default useGetChannelData
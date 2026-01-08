import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiLogOut } from "react-icons/fi";
import { MdOutlineSwitchAccount } from "react-icons/md"; 
import axios from 'axios';
import { FcGoogle } from "react-icons/fc";
import { TiUserAddOutline } from "react-icons/ti";
import { serverUrl } from '../App';
import { SiYoutubestudio } from "react-icons/si";
import { useNavigate } from 'react-router-dom';
import { showCustomAlert } from './CustomAlert';
import { setUserData } from '../redux/userSlice';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../utils/firebase';

function Profile() {
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleSignout = async() =>{
      try{
        const result = await axios.get(serverUrl + "/api/auth/signout" , {withCredentials:true})
        dispatch(setUserData(null))
        console.log(result.data)
        showCustomAlert("Signout Successfully")
      } catch(error){
           console.log(error)
        showCustomAlert("Signout error")
      }
    }

    const handleGoogleAuth = async () => {
      try{

        const response = await signInWithPopup(auth,provider)
        console.log(response)
        let user = response.user
       
        let userName = user.displayName
        let email = user.email
        let photoUrl = user.photoURL

        const formData = new FormData()
        formData.append("userName",userName)
        formData.append("email",email)
        formData.append("photoUrl",photoUrl)

        const result = await axios.post(serverUrl+ "/api/auth/googleauth" , formData,
          {withCredentials:true})
          dispatch(setUserData(result.data))
          console.log(result.data)
          showCustomAlert("Google Authentication Successfully")
        
      }catch (error) {
      console.log(error);
      showCustomAlert("Google Auth error")
      

      }
    }
  return (
    <div>
      <div className='absolute right-5 top-10 mt-2 w-72 bg-[#212121] text-white rounded-xl shadow-lg z-50
      hidden md:block'>
            {userData && <div className='flex items-center  justify-items-start gap-3 p-4 border-b border-gray-700'>
            <img src={userData?.photoUrl} alt="" className='w-12 h-12 flex items-center 
            justify-center rounded-full object-cover border border-gray-700' />
            <div>
                <h4 className='font-semibold'>{userData?.userName}</h4>
                <p className='text-sm text-gray-400'>{userData?.email}</p>
                <p className='text-sm text-blue-400 cursor-pointer hover:underline'
                onClick={()=>{userData?.channel ? navigate("/viewchannel") :navigate("/createchannel")}}>
                    {userData?.channel ? "View Channel" : "Create Channel"}
                </p>
            </div>
        </div>}
        <div className='flex flex-col py-2'>
          <button className='flex items-center gap-3 px-4 py-2 hover:bg-gray-700' onClick=
          {handleGoogleAuth}>
            <FcGoogle className='text-xl'/>Sign in with google account
          </button>

          <button className='flex items-center gap-3 px-4 py-2 hover:bg-gray-700'
          onClick={()=>navigate("/signup")}>
            <TiUserAddOutline className='text-xl'/>Create new Account
          </button>

          <button className='flex items-center gap-3 px-4 py-2 hover:bg-gray-700'
          onClick={()=>navigate("/signin")}>
            <MdOutlineSwitchAccount className='text-xl'/>Sign in with other account
          </button>

         {userData?.channel && (
          <button className='flex items-center gap-3 px-4 py-2 hover:bg-gray-700' onClick={()=>navigate("/ptstudio/dashboard")}>  
             <SiYoutubestudio className='w-5 h-5 text-orange-400'/>PT Studio
           </button>
         )}

         {userData && (
           <button className='flex items-center gap-3 px-4 py-2 hover:bg-gray-700'
           onClick={handleSignout}>
             <FiLogOut className='text-xl'/>Signout
           </button>
         )}
        </div>
      </div>
    </div>
  )
}

export default Profile
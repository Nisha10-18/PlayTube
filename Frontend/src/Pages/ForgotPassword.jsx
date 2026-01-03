import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/playtube1.png'
import axios from "axios"
import { showCustomAlert } from '../components/CustomAlert'
import { ClipLoader } from 'react-spinners'
import { serverUrl } from '../App'

const ForgotPassword = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await axios.post(
        serverUrl + "/api/auth/sendotp",
        { email },
        { withCredentials: true }
      )
      setStep(2)
      showCustomAlert(result.data.message)
    } catch (error) {
      console.log(error)
      showCustomAlert("Send OTP error")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await axios.post(
        serverUrl + "/api/auth/verifyotp",
        { email, otp },
        { withCredentials: true }
      )
      setStep(3)
      showCustomAlert(result.data.message)
    } catch (error) {
      console.log(error)
      showCustomAlert("Verify OTP error")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (loading) return

    if (newPassword !== confirmPassword) {
      showCustomAlert("Password does not match")
      return
    }

    setLoading(true)
    try {
      const result = await axios.post(
        serverUrl + "/api/auth/resetpassword",
        { email, password: newPassword },
        { withCredentials: true }
      )
      showCustomAlert(result.data.message)
      navigate("/signin")
    } catch (error) {
      console.log(error)
      showCustomAlert("Reset password error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex flex-col bg-[#202124] text-white'>
      <header className='flex items-center gap-2 p-4 border-b border-gray-700'>
        <img src={logo} alt="logo" className="w-8 h-8" />
        <span className='font-bold text-xl tracking-tight font-roboto'>
          PlayTube
        </span>
      </header>

      <main className='flex flex-1 items-center justify-center px-4'>
        
        {/* STEP 1 */}
        {step === 1 && (
          <div className='w-full max-w-md bg-[#171717] p-8 rounded-2xl shadow-lg'>
            <h2 className='text-2xl font-semibold mb-6'>Forgot Password</h2>

            <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                className='w-full px-4 py-3 bg-[#202124] border border-gray-600 rounded-md text-white'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                required
              />

              <button
                className='w-full bg-orange-600 py-2 rounded-md'
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? <ClipLoader size={18} /> : "Send OTP"}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className='w-full max-w-md bg-[#171717] p-8 rounded-2xl shadow-lg'>
            <h2 className='text-2xl font-semibold mb-6'>Enter OTP</h2>

            <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                className='w-full px-4 py-3 bg-[#202124] border border-gray-600 rounded-md text-white'
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />

              <button
                className='w-full bg-orange-600 py-2 rounded-md'
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? <ClipLoader size={18} /> : "Verify OTP"}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className='w-full max-w-md bg-[#171717] p-8 rounded-2xl shadow-lg'>
            <h2 className='text-2xl font-semibold mb-4'>Reset Password</h2>

            <form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
              <input
                type="password"
                className='w-full px-4 py-3 bg-[#202124] border border-gray-600 rounded-md text-white'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                required
              />

              <input
                type="password"
                className='w-full px-4 py-3 bg-[#202124] border border-gray-600 rounded-md text-white'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
              />

              <button
                className='w-full bg-orange-600 py-2 rounded-md'
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? <ClipLoader size={18} /> : "Reset Password"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

export default ForgotPassword
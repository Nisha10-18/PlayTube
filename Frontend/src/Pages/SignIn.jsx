import React, { useState } from "react";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import logo from "../assets/playtube1.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { ClipLoader } from "react-spinners";
import { showCustomAlert } from "../components/CustomAlert";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function SignIn() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1 && !email) {
      showCustomAlert("Please fill in all fields");
      return;
    }
    setStep(2);
  };

  const handleSignIn = async () => {
    if (!password) {
      showCustomAlert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(
        serverUrl + "/api/auth/signin",
        { email, password },
        { withCredentials: true }
      );

      console.log(result.data);
      dispatch(setUserData(result.data))
      navigate("/")
      setLoading(false)
      showCustomAlert("User SignIn Successfully");
    } catch (error) {
      console.log(error);
      showCustomAlert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#181818]">
      <div className="bg-[#202124] rounded-2xl p-10 w-full max-w-md shadow-lg">

        {/* HEADER */}
        <div className="flex items-center mb-6">
          <button
            className="text-gray-300 mr-3 hover:text-white"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate("/"))}
          >
            <FaArrowLeft size={20} />
          </button>
          <span className="text-white text-2xl font-medium">PlayTube</span>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h1 className="text-3xl text-white mb-5 flex items-center gap-2">
              <img src={logo} alt="logo" className="w-8 h-8" />
              SignIn
            </h1>

            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 bg-transparent border border-gray-500 rounded-md px-3 py-3 text-white"
            />

            <div className="flex justify-between items-center mt-10">
              <button
                className="text-orange-400 text-sm hover:underline"
                onClick={() => navigate("/signup")}
              >
                Create Account
              </button>

              <button
                onClick={handleNext}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h1 className="text-3xl text-white mb-5 flex items-center gap-2">
              <img src={logo} alt="logo" className="w-8 h-8" />
              Welcome
            </h1>

            <div className="flex items-center bg-[#3c4043] text-white px-3 py-2 rounded-full w-fit mb-6">
              <FaUserCircle className="mr-2" />
              {email}
            </div>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 bg-transparent border border-gray-500 rounded-md px-3 py-3 text-white"
            />

            <div className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label className="text-gray-300 cursor-pointer">
                Show Password
              </label>
            </div>

            <div className="flex justify-between items-center mt-10">
              <button className="text-orange-400 text-sm hover:underline" onClick={()=>navigate("/forgotpass")}>
                Forgot Password
              </button>

              <button
                onClick={handleSignIn}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full"
              >
                {loading ? <ClipLoader size={20} color="black" /> : "SignIn"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SignIn;
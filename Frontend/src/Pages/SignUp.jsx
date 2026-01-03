import React, { useState } from "react";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import logo from "../assets/playtube1.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { ClipLoader } from "react-spinners";
import { showCustomAlert } from "../components/CustomAlert";
import { setUserData } from "../redux/userSlice";


import { useDispatch } from "react-redux";

function SignUp() {
  const [step, setStep] = useState(1);

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [backendImage, setBackendImage] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch()

  /* ================= NEXT STEP ================= */
  const handleNext = () => {
    if (step === 1 && (!userName || !email)) {
      showCustomAlert("Please fill in all fields");
      return;
    }

    if (step === 2) {
      if (!password || !confirmPassword) {
        showCustomAlert("Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        showCustomAlert("Passwords do not match");
        return;
      }
    }

    setStep(step + 1);
  };

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  /* ================= SIGN UP ================= */
  const handleSignUp = async () => {
    if (!backendImage) {
      showCustomAlert("Please upload profile picture");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("userName", userName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("photoUrl", backendImage); // must match multer field name

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        formData,
        { withCredentials: true }
      );

      console.log(result.data);
     dispatch(setUserData(result.data))


      setLoading(false)
      showCustomAlert("Account Created Successfully");
      navigate("/");
    } catch (error) {
      console.log(error);
      showCustomAlert(
        error.response?.data?.message || "Signup failed"
      );
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
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else navigate("/");
            }}
          >
            <FaArrowLeft size={20} />
          </button>
          <span className="text-white text-2xl font-medium">
            Create Account
          </span>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h1 className="text-3xl text-white mb-5 flex items-center gap-2">
              <img src={logo} alt="logo" className="w-8 h-8" />
              Basic Info
            </h1>

            <input
              type="text"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full mb-4 bg-transparent border border-gray-500 rounded-md px-3 py-3 text-white"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 bg-transparent border border-gray-500 rounded-md px-3 py-3 text-white"
            />

            <div className="flex justify-end mt-10">
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
              Security
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

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

            <div className="flex justify-end mt-10">
              <button
                onClick={handleNext}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <h1 className="text-3xl text-white mb-5 flex items-center gap-2">
              <img src={logo} alt="logo" className="w-8 h-8" />
              Choose Avatar
            </h1>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-28 h-28 rounded-full border-4 border-gray-500 overflow-hidden shadow-lg">
                {frontendImage ? (
                  <img
                    src={frontendImage}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-gray-500 w-full h-full p-2" />
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-sm text-gray-400 cursor-pointer"
              />
            </div>

            <div className="flex justify-end mt-10">
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full"
              >
                {loading ? <ClipLoader color="black" size={20} /> : "Create Account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SignUp;

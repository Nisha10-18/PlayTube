import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import logo from "../../assets/playtube1.png";
import { ClipLoader } from "react-spinners";
import { showCustomAlert } from "../../components/CustomAlert";
import { serverUrl } from "../../App";
import { setChannelData } from "../../redux/userSlice";

const UpdateChannel = () => {
  const { channelData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [channelName, setChannelName] = useState(channelData?.name || "");
  const [description, setDescription] = useState(channelData?.description || "");
  const [category, setCategory] = useState(channelData?.category || "");
  const [loading, setLoading] = useState(false);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) setAvatar(file);
  };

  const handleBanner = (e) => {
    const file = e.target.files[0];
    if (file) setBanner(file);
  };

  const handleUpdateChannel = async () => {
    const formData = new FormData();
    formData.append("name", channelName);
    formData.append("description", description);
    formData.append("category", category);
    if (avatar) formData.append("avatar", avatar);
    if (banner) formData.append("banner", banner);

    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/user/updatechannel`,
        formData,
        { withCredentials: true }
      );

      setLoading(false);
      dispatch(setChannelData(res.data));
      showCustomAlert("Channel Updated");
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.error(error);
      showCustomAlert("Channel Update Error");
    }
  };

  // Reusable avatar/banner preview component
  const ImagePreview = ({ file, fallback, className }) => {
    if (file) return <img src={URL.createObjectURL(file)} className={className} alt="preview" />;
    return fallback;
  };

  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <img src={logo} alt="logo" className="w-8 h-8 object-cover" />
          <span className="font-bold text-xl">PlayTube</span>
        </div>
      </header>

      <main className="flex flex-1 justify-center items-center px-4">
        <div className="bg-[#212121] p-6 rounded-xl w-full max-w-lg shadow-lg">

          {/* STEP 1: Avatar & Name */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Customize Channel</h2>
              <p className="text-sm text-gray-400 mb-6">Choose your profile picture and channel name</p>

              <div className="flex flex-col items-center mb-6">
                <label htmlFor="avatar" className="cursor-pointer flex flex-col items-center">
                  <ImagePreview
                    file={avatar}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-600"
                    fallback={
                      <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                        <FaUserCircle size={40} className="text-gray-400" />
                      </div>
                    }
                  />
                  <span className="text-orange-400 text-sm mt-2">Upload Avatar</span>
                  <input type="file" id="avatar" className="hidden" accept="image/*" onChange={handleAvatar} />
                </label>
              </div>

              <input
                type="text"
                placeholder="Channel Name"
                className="w-full p-3 mb-4 rounded-lg bg-[#121212] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
              />

              <button
                onClick={nextStep}
                disabled={!channelName}
                className="w-full bg-orange-600 py-3 rounded-lg disabled:bg-gray-600"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2: Preview */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Your Updated Channel</h2>
              <div className="flex flex-col items-center mb-6">
                <ImagePreview
                  file={avatar}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-600"
                  fallback={<FaUserCircle size={50} />}
                />
                <h2 className="mt-3 text-lg font-semibold">{channelName}</h2>
              </div>
              <button onClick={nextStep} className="w-full bg-orange-600 py-3 rounded-lg">Continue</button>
              <span onClick={prevStep} className="block text-center text-blue-400 mt-2 cursor-pointer">Back</span>
            </div>
          )}

          {/* STEP 3: Banner, Description & Category */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Customize Channel</h2>

              <label htmlFor="banner" className="cursor-pointer block mb-4">
                <ImagePreview
                  file={banner}
                  className="w-full h-32 object-cover rounded-lg mb-2 border border-gray-700"
                  fallback={
                    <div className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 border border-gray-700 mb-2">
                      Click to upload banner image
                    </div>
                  }
                />
                <input type="file" id="banner" className="hidden" accept="image/*" onChange={handleBanner} />
              </label>

              <textarea
                className="w-full p-3 mb-4 rounded-lg bg-[#121212] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Channel Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                type="text"
                placeholder="Channel Category"
                className="w-full p-3 mb-6 rounded-lg bg-[#121212] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

              <button
                onClick={handleUpdateChannel}
                disabled={!description || !category || loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 transition py-3 rounded-lg font-medium disabled:bg-gray-600"
              >
                {loading ? <ClipLoader color="black" size={20} /> : "Save & Customize Channel"}
              </button>

              <span onClick={prevStep} className="block text-center mt-2 cursor-pointer">Back</span>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default UpdateChannel;

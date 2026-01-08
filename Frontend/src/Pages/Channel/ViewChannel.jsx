import React from "react";
import { useSelector } from "react-redux";
import create from "../../assets/create.png"
import { useNavigate } from "react-router-dom";


function ViewChannel() {
  const {channelData} = useSelector((state) => state.user);
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3">

      {/* ===== Banner ===== */}
      
        <div className="w-full h-50 bg-gray-700 relative mb-10 mt-10 rounded-lg border-1 border-gray-500">
        {channelData?.banner ? (
          <img
            src={channelData?.banner}
            
            className="w-full h-full object-cover rounded-lg"
          />
        ):(
          <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900"></div>
        
      )}
      </div>

      {/* ===== Profile Section ===== */}
      <div className="px-10 py-8">
        <div className="flex flex-col items-center">

          <img
            src={channelData?.avatar}
            alt=""
            className="w-28 h-28 rounded-full object-cover border-gray-500 
            border-4"
          />

          <h1 className="text-2xl font-bold mt-3">
            {channelData?.name}
          </h1>

          <p className="text-gray-400">
            {channelData?.owner?.email}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            More about this channel...{" "}
            <span className="text-orange-400 cursor-pointer">
              {channelData?.category}
            </span>
          </p>

          {/* ===== Buttons ===== */}
          <div className="flex gap-4 mt-4">
            <button className="bg-white text-black px-4 py-1 rounded-full font-medium active:bg-gray-900 active:text-white cursor-pointer"
            onClick={()=>navigate("/updatechannel")}>
              Customize channel
            </button>

            <button className="bg-[#272727] px-4 py-1 rounded-full font-medium active:bg-gray-200 active:text-black cursor-pointer" onClick={()=>navigate("/ptstudio/dashboard")}> {/*changes */}
              Manage Videos
            </button>
          </div>
        </div>
      </div>

      {/* ===== Empty Content Section ===== */}
      <div className="flex flex-col items-center mt-16">
        <img src={create} alt="create" className="w-20" />

        <p className="mt-4 font-medium">
          Create content on any device
        </p>

        <p className="text-gray-400 text-sm text-center mt-1">
          Upload and record at home or on the go.  
          Everything you make public will appear here.
        </p>

        <button onClick={()=>navigate("/create")} className="bg-white text-black mt-4 px-5 py-1 rounded-full font-medium cursor-pointer">
          + Create
        </button>
      </div>

    </div>
  );
}

export default ViewChannel;

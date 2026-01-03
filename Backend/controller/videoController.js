import uploadOnCloudinary from "../config/cloudinary.js";
import Channel from "../model/channelModel.js";
import Video from "../model/videoModel.js";




export const createVideo = async (req, res) => {
  try {
    const { title, description, tags, channelId } = req.body;

    if (!title || !req.files?.video || !req.files?.thumbnail || !channelId) {
      return res
        .status(400)
        .json({ message: "title, video, thumbnail, channelId is required" });
    }

    const channelData = await Channel.findById(channelId);
    if (!channelData) {
      return res.status(400).json({ message: "Channel is not found by Id" });
    }

    const uploadVideo = await uploadOnCloudinary(req.files.video[0].path);
    const uploadThumbnail = await uploadOnCloudinary(
      req.files.thumbnail[0].path
    );

    let parsedTag = [];
    if (tags) {
      try {
        parsedTag = JSON.parse(tags);
      } catch (error) {
        parsedTag = [];
      }
    }

    let newVideo = await Video.create({
      title,
      channel: channelData._id,
      description,
      tags: parsedTag,
      videoUrl: uploadVideo,
      thumbnail: uploadThumbnail,
    });

    await Channel.findByIdAndUpdate(
      channelData._id,
      { $push: { videos: newVideo._id } },
      { new: true }
    );

    // ✅ FIX: populate channel before sending response
    newVideo = await newVideo.populate("channel");

    return res.status(201).json(newVideo);
  } catch (error) {
    return res.status(500).json({ message: `Failed to create video ${error}` });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .populate("channel comments.author comments.replies.author");

    if (!videos) {
      return res.status(400).json({ message: "Videos are not found" });
    }

    // ✅ FIX: return response (was missing)
    return res.status(200).json(videos);
  } catch (error) {
    return res.status(500).json({ message: `failed to get videos ${error}` });
  }
};

export const toggleLikes = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.userId;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(400).json({ message: "Video is not found" });
    }
    if (video.likes.includes(userId)) {
      video.likes.pull(userId);
    } else {
      video.likes.push(userId);
      video.dislikes.pull(userId);
    }
    await video.save();
    return res.status(200).json(video);
  } catch (error) {
    return res.status(500).json({ message: `failed to like video ${error}` });
  }
};

export const toggleDislikes = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.userId;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(400).json({ message: "Video is not found" });
    }
    if (video.dislikes.includes(userId)) {
      video.dislikes.pull(userId);
    } else {
      video.dislikes.push(userId);
      video.likes.pull(userId);
    }
    await video.save();
    return res.status(200).json(video);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to dislike video ${error}` });
  }
};

export const toggleSave = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.userId;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(400).json({ message: "Video is not found" });
    }

    if (video.saveBy.includes(userId)) {
      video.saveBy.pull(userId);
    } else {
      video.saveBy.push(userId);
    }

    await video.save();
    return res.status(200).json(video);
  } catch (error) {
    return res.status(500).json({ message: `failed to save video ${error}` });
  }
};

export const getViews = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: { views: 1 },
      },
      { new: true }
    );

    if (!video) {
      return res.status(400).json({ message: "Video is not found" });
    }
    return res.status(200).json(video);
  } catch (error) {
    return res.status(500).json({ message: `failed to adding view ${error}` });
  }
};

export const addComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { message } = req.body;
    const userId = req.userId;
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(400).json({ message: "Video is not found" });
    }

    video?.comments.push({ author: userId, message });
    await video.save();

    const populatedVideo = await Video.findById(videoId)
      .populate({
        path: "comments.author",
        select: "userName photoUrl email",
      })
      .populate({
        path: "comments.replies.author",
        select: "userName photoUrl email",
      });
    return res.status(200).json(populatedVideo);
  } catch (error) {
    return res.status(500).json({ message: `Error adding comments ${error}` });
  }
};

export const addReply = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(400).json({ message: "Video is not found" });
    }

    const comment = video.comments.id(commentId);
    if (!comment) {
      return res.status(400).json({ message: "Comment is not found" });
    }

    comment.replies.push({
      author: userId,
      message,
    });

    await video.save();

    const populatedVideo = await Video.findById(videoId)
      .populate("comments.author", "userName photoUrl email")
      .populate("comments.replies.author", "userName photoUrl email");

    return res.status(200).json(populatedVideo);
  } catch (error) {
    return res.status(500).json({
      message: `Error adding reply ${error.message}`,
    });
  }
};

export const getLikedVideos = async (req, res) => {
  try {
    const userId = req.userId;

    const likedVideo = await Video.find({ likes: userId })
      .populate("channel", "name avatar")
      .populate("likes", "username");
    if (!likedVideo) {
      return res.status(400).json({ message: "failed to get liked Videos" });
    }
    return res.status(200).json(likedVideo);
  } catch (error) {
    return res.status(500).json({
      message: `Error to find liked Videos ${error}`,
    });
  }
};

export const getSavedVideos = async (req,res) => {
   try {
    const userId = req.userId;

    const SavedVideo = await Video.find({ saveBy: userId })
      .populate("channel", "name avatar")
      .populate("likes", "username");
    if (!SavedVideo) {
      return res.status(400).json({ message: "failed to get saved Videos" });
    }
    return res.status(200).json(SavedVideo);
  } catch (error) {
    return res.status(500).json({
      message: `Error to find saved Videos ${error}`,
    });
  }
}



export const fetchVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)
      .populate("channel", "name avatar") // show channel info
      .populate("likes", "username photourl"); // optional: who liked it

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    return res.status(200).json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    return res.status(500).json({
      message: "Error fetching video",
      error: error.message,
    });
  }
};



export const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, tags } = req.body;

    // Find the video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Update fields if provided
    if (title) video.title = title;
    if (description) video.description = description;

    // Parse tags if sent
    if (tags) {
      try {
        video.tags = JSON.parse(tags);
      } catch {
       video.tags = [];
      }
    }

    // if new thumbnail uploaded (single file)

    if(req.file) {
      const uploadedThumbnail = await uploadOnCloudinary(req.file.path);
      video.thumbnail = uploadedThumbnail;
    }
    await video.save();

    return res.status(200).json( video
    );
  } catch(error) {
    console.error("Error updating video:", error);
    return res
    .status(500)
    .json({message:"Error updating video",error:error.message});
  }
};

//Delete video

// delete video controller
export const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    // find video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // remove video reference from channel
    await Channel.findByIdAndUpdate(
      video.channel,
      {
        $pull: { videos: video._id },
      });

    // delete video document
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json({
      message: "Video deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting video:",error);
    return res.status(500).json({
      message: "Error deleting video",
      error: error.message});
  }
};
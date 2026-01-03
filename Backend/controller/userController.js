import uploadOnCloudinary from "../config/cloudinary.js";
import Channel from "../model/channelModel.js";
import User from "../model/userModel.js";
import mongoose from "mongoose";
import Short from "../model/shortModel.js";
import Video from "../model/videoModel.js";

/* ================= GET CURRENT USER ================= */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `getCurrentUser error: ${error.message}` });
  }
};

/* ================= CREATE CHANNEL ================= */
export const createChannel = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const userId = req.userId;

    const existingChannel = await Channel.findOne({ owner: userId });
    if (existingChannel) {
      return res.status(400).json({ message: "User already has a channel" });
    }

    const nameExists = await Channel.findOne({ name });
    if (nameExists) {
      return res.status(400).json({ message: "Channel name already taken" });
    }

    let avatar, banner;
    if (req.files?.avatar) {
      avatar = await uploadOnCloudinary(req.files.avatar[0].path);
    }
    if (req.files?.banner) {
      banner = await uploadOnCloudinary(req.files.banner[0].path);
    }

    const channel = await Channel.create({
      name,
      description,
      category,
      avatar,
      banner,
      owner: userId,
    });

    await User.findByIdAndUpdate(userId, {
      channel: channel._id,
      userName: name,
      photoUrl: avatar,
    });

    return res.status(201).json(channel);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Create Channel error: ${error.message}` });
  }
};

/* ================= UPDATE CHANNEL ================= */
export const updateChannel = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const userId = req.userId;

    const channel = await Channel.findOne({ owner: userId });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (name && name !== channel.name) {
      const nameExists = await Channel.findOne({ name });
      if (nameExists) {
        return res.status(400).json({ message: "Channel name already taken" });
      }
      channel.name = name;
    }

    if (description !== undefined) channel.description = description;
    if (category !== undefined) channel.category = category;

    if (req.files?.avatar) {
      const avatar = await uploadOnCloudinary(req.files.avatar[0].path);
      channel.avatar = avatar;
    }

    if (req.files?.banner) {
      const banner = await uploadOnCloudinary(req.files.banner[0].path);
      channel.banner = banner;
    }

    const updatedChannel = await channel.save();

    await User.findByIdAndUpdate(userId, {
      userName: name || undefined,
      photoUrl: channel.avatar || undefined,
    });

    return res.status(200).json(updatedChannel);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Update Channel error: ${error.message}` });
  }
};

/* ================= GET CHANNEL DATA ================= */
export const getChannelData = async (req, res) => {
  try {
    const userId = req.userId;

    const channel = await Channel.findOne({ owner: userId })
      .populate("owner")
      .populate("videos")
      .populate("shorts")
      .populate({
        path: "communityPosts",
        select: "content image createdAt comments channel",
        populate: [
          {
            path: "channel",
            select: "name avatar",
          },
          {
            path: "comments.author",
            select: "userName photoUrl",
          },
          {
            path: "comments.replies.author",
            select: "userName photoUrl",
          },
        ],
      })
      .populate({
        path: "playlists",
        populate: {
          path: "videos",
          select: "thumbnail title",
        },
      });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    return res.status(200).json(channel);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to get Channel: ${error.message}` });
  }
};

/* ================= TOGGLE SUBSCRIBE ================= */
export const toggleSubscribe = async (req, res) => {
  try {
    const { channelId } = req.body;
    const userId = req.userId;

    if (!channelId) {
      return res.status(400).json({ message: "ChannelId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channelId" });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isSubscribed = channel.subscribers.some(
      (id) => id.toString() === userId
    );

    if (isSubscribed) {
      channel.subscribers.pull(userId);
    } else {
      channel.subscribers.push(userId);
    }

    await channel.save();

    return res.status(200).json({
      subscribers: channel.subscribers,
      isSubscribed: !isSubscribed,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to toggle subscribe: ${error.message}` });
  }
};

/* ================= GET ALL CHANNEL DATA ================= */
export const getAllChannelData = async (req, res) => {
  try {
    const channels = await Channel.find()
      .populate("owner")
      .populate("videos")
      .populate("shorts")
      .populate("subscribers")
      .populate({
        path: "communityPosts",
        select: "content image createdAt comments channel",
        populate: [
          { path: "channel", select: "name avatar" },
          { path: "comments.author", select: "userName photoUrl" },
          { path: "comments.replies.author", select: "userName photoUrl" },
        ],
      })
      .populate({
        path: "playlists",
        populate: {
          path: "videos",
          populate: { path: "channel" },
        },
      });

    return res.status(200).json(channels);
  } catch (error) {
    return res.status(500).json({
      message: "failed to get all channels",
      error: error.message,
    });
  }
};

/* ================= GET SUBSCRIBED DATA ================= */
export const getSubscribedData = async (req, res) => {
  try {
    const userId = req.userId;

    const subscribedChannels = await Channel.find({
      subscribers: userId,
    })
      .populate({
        path: "videos",
        populate: { path: "channel", select: "name avatar" },
      })
      .populate({
        path: "shorts",
        populate: { path: "channel", select: "name avatar" },
      })
      .populate({
        path: "communityPosts",
        select: "content image createdAt comments , channel",
        populate: [
          { path: "channel", select: "name avatar" },
          { path: "comments.author", select: "userName photoUrl" },
          { path: "comments.replies.author", select: "userName photoUrl" },
        ],
      });

    const videos = subscribedChannels.flatMap((ch) => ch.videos);
    const shorts = subscribedChannels.flatMap((ch) => ch.shorts);
    const posts = subscribedChannels.flatMap((ch) => ch.communityPosts);

    return res.status(200).json({
      subscribedChannels,
      videos,
      shorts,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Server error while fetching subscribed content ${error.message}`,
    });
  }
};

/* ================= HISTORY ================= */
export const addHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { contentId, contentType } = req.body;

    if (!["Video", "Short"].includes(contentType)) {
      return res.status(400).json({ message: "Invalid contentType" });
    }

    const content =
      contentType === "Video"
        ? await Video.findById(contentId)
        : await Short.findById(contentId);

    if (!content)
      return res.status(404).json({ message: `${contentType} not found` });

    await User.findByIdAndUpdate(userId, {
      $pull: { history: { contentId, contentType } },
    });

    await User.findByIdAndUpdate(userId, {
      $push: {
        history: { contentId, contentType, watchedAt: new Date() },
      },
    });

    res.status(200).json({ message: "Added to history" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: "history.contentId",
        populate: { path: "channel", select: "name avatar" },
      })
      .select("history");

    const sortedHistory = [...user.history].sort(
      (a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)
    );

    return res.status(200).json(sortedHistory);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getRecommendedContent = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Get user with history
    const user = await User.findById(userId)
      .populate("history.contentId")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    // Collect keywords from history
    const historyKeywords = user.history.map(
      h => h.contentId?.title || ""
    );

    // Collect liked & saved content
    const likedVideos = await Video.find({ likes: userId });
    const likedShorts = await Short.find({ likes: userId });
    const savedVideos = await Video.find({ likes: userId });
    const savedShorts = await Short.find({ likes: userId });

    const likedSavedKeywords = [
      ...likedVideos.map(v => v.title),
      ...likedShorts.map(s => s.title),
       ...savedVideos.map(v => v.title),
      ...savedShorts.map(s => s.title),
    ];

    // Merge all keywords
    const allKeywords = [...historyKeywords, ...likedSavedKeywords]
      .filter(Boolean)
      .map(k => k.split(" "))
      .flat();

    // Build regex conditions
    const videoConditions = [];
    const shortConditions = [];

    allKeywords.forEach(kw => {
      videoConditions.push(
        { title: { $regex: kw, $options: "i" } },
        { description: { $regex: kw, $options: "i" } },
        { tags: { $regex: kw, $options: "i" } }
      );

      shortConditions.push(
        { title: { $regex: kw, $options: "i" } },
        { tags: { $regex: kw, $options: "i" } }
      );
    });

    // Recommended content
    const recommendedVideos = await Video.find({ $or: videoConditions })
      .populate("channel comments.author comments.replies.author");

    const recommendedShorts = await Short.find({ $or: shortConditions })
      .populate("channel", "name avatar")
      .populate("likes", "username photoUrl");

    // Remaining content (exclude recommended)
    const recommendedVideoIds = recommendedVideos.map(v => v._id);
    const recommendedShortIds = recommendedShorts.map(s => s._id);

    const remainingVideos = await Video.find({
      _id: { $nin: recommendedVideoIds },
    })
      .sort({ createdAt: -1 })
      .populate("channel");

    const remainingShorts = await Short.find({
      _id: { $nin: recommendedShortIds },
    })
      .sort({ createdAt: -1 })
      .populate("channel");

    return res.status(200).json({
      recommendedVideos,
      recommendedShorts,
      remainingVideos,
      remainingShorts,
      usedKeywords: allKeywords,
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    return res.status(500).json({ message: `Failed: ${error.message}` });
  }
};
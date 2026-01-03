import uploadOnCloudinary from "../config/cloudinary.js";
import Short from "../model/shortModel.js";
import Channel from "../model/channelModel.js";

/* ================= CREATE SHORT ================= */
export const createShort = async (req, res) => {
  try {
    const { title, description, tags, channelId } = req.body;

    if (!title || !channelId) {
      return res
        .status(400)
        .json({ message: "Short title and channelId is required" });
    }

    let shortUrl;
    if (req.file) {
      shortUrl = await uploadOnCloudinary(req.file.path);
    }

    const channelData = await Channel.findById(channelId);
    if (!channelData) {
      return res.status(400).json({ message: "Channel not found" });
    }

    const newShort = await Short.create({
      channel: channelData._id,
      title,
      description,
      shortUrl,
      tags: tags ? JSON.parse(tags) : [],
    });

    await Channel.findByIdAndUpdate(
      channelData._id,
      { $push: { shorts: newShort._id } },
      { new: true }
    );

    return res.status(201).json(newShort);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to create short ${error}` });
  }
};
export const fetchShort = async (req, res) => {
  try {
    const { shortId } = req.params;

    const short = await Short.findById(shortId)
      .populate("channel", "name avatar")
      .populate("likes", "username photoUrl");

    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }

    return res.status(200).json(short);

  } catch (error) {
    console.error("Error fetching short:", error);
    return res.status(500).json({
      message: "Error fetching short",
      error: error.message,
    });
  }
};
export const updateShort = async (req, res) => {
  try {
    const { shortId } = req.params;
    const { title, tags, description } = req.body;

    const short = await Short.findById(shortId);

    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }

    if (title) short.title = title;
    if (description) short.description = description;

    if (tags) {
      try {
        short.tags = JSON.parse(tags);
      } catch (err) {
        short.tags = [];
      }
    }

    await short.save();

    return res.status(200).json({
      message: "Short updated successfully",
      short,
    });

  } catch (error) {
    console.error("Error updating short:", error);
    return res.status(500).json({
      message: "Error updating short",
      error: error.message,
    });
  }
};
export const deleteShort = async (req, res) => {
  try {
    const { shortId } = req.params;

    const short = await Short.findById(shortId);

    if (!short) {
      return res.status(404).json({ message: "Short not found" });
    }

    // Remove short reference from channel
    await Channel.findByIdAndUpdate(short.channel, {
      $pull: { shorts: short._id },
    });

    // Delete the short
    await Short.findByIdAndDelete(shortId);

    return res.status(200).json({
      message: "Short deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting short:", error);
    return res.status(500).json({
      message: "Error deleting short",
      error: error.message,
    });
  }
};

/* ================= GET ALL SHORTS ================= */
export const getAllShorts = async (req, res) => {
  try {
    const shorts = await Short.find()
      .sort({createdAt: -1})
      .populate("channel comments.author comments.replies.author");
       if (!shorts) {
      return res.status(400).json({ message: "short is not found" });
    }  
    return res.status(200).json(shorts);
  } catch (error) {
    return res.status(500).json({ message: `failed to get shorts ${error}` });
  }
};

/* ================= TOGGLE LIKE ================= */
export const toggleLikes1 = async (req, res) => {
  try {
    const { shortId } = req.params;
    const userId = req.userId;

    const short = await Short.findById(shortId);
    if (!short) {
      return res.status(400).json({ message: "short is not found" });
    }

    const isLiked = short.likes.some(
      (id) => id.toString() === userId
    );

    if (isLiked) {
      short.likes.pull(userId);
    } else {
      short.likes.push(userId);
      short.dislikes.pull(userId);
    }

    await short.save();
    await short.populate("comments.author", "userName photoUrl");
    await short.populate("comments.replies.author", "userName photoUrl");
    await short.populate("channel");
    return res.status(200).json(short);
  } catch (error) {
    return res.status(500).json({ message: `failed to like short ${error}` });
  }
};

/* ================= TOGGLE DISLIKE ================= */
export const toggleDislikes1 = async (req, res) => {
  try {
    const { shortId } = req.params;
    const userId = req.userId;

    const short = await Short.findById(shortId);
    if (!short) {
      return res.status(400).json({ message: "short is not found" });
    }

    const isDisliked = short.dislikes.some(
      (id) => id.toString() === userId
    );

    if (isDisliked) {
      short.dislikes.pull(userId);
    } else {
      short.dislikes.push(userId);
      short.likes.pull(userId);
    }
        await short.populate("comments.author", "userName photoUrl");
    await short.populate("comments.replies.author", "userName photoUrl");
    await short.populate("channel");

    await short.save();
   

    return res.status(200).json(short);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to dislike short ${error}` });
  }
};

/* ================= TOGGLE SAVE ================= */
export const toggleSave1 = async (req, res) => {
  try {
    const { shortId } = req.params;
    const userId = req.userId;

    const short = await Short.findById(shortId);
    if (!short) {
      return res.status(400).json({ message: "Short is not found" });
    }

    if (short.savedBy.includes(userId)) {
      short.savedBy.pull(userId);
    } else {
      short.savedBy.push(userId);
    }

    await short.save();
    await short.populate("channel");

    return res.status(200).json(short);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to save short ${error}` });
  }
};

/* ================= ADD VIEW ================= */
export const getViews1 = async (req, res) => {
  try {
    const { shortId } = req.params;

    const short = await Short.findByIdAndUpdate(
      shortId,
      { $inc: { views: 1 } },
      { new: true }
    )

    if (!short) {
      return res.status(400).json({ message: "short is not found" });
    }

      await short.populate("comments.author", "userName photoUrl");
    await short.populate("comments.replies.author", "userName photoUrl");
    await short.populate("channel");
    return res.status(200).json(short)

  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to adding view ${error}` });
  }
};

/* ================= ADD COMMENT ================= */
export const addComment1 = async (req, res) => {
  try {
    const { shortId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    const short = await Short.findById(shortId);
    if (!short) {
      return res.status(400).json({ message: "short is not found" });
    }

    short.comments.push({ author: userId, message });
    await short.save();

    await short.populate("comments.author", "userName photoUrl");
    await short.populate("comments.replies.author", "userName photoUrl");
    await short.populate("channel");

    return res.status(200).json(short);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error adding comments ${error}` });
  }
};

/* ================= ADD REPLY ================= */
/* ================= ADD REPLY ================= */
export const addReply1 = async (req, res) => {
  try {
    const { shortId, commentId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    if (!message) {
      return res.status(400).json({ message: "Reply message is required" });
    }

    const short = await Short.findById(shortId);
    if (!short) {
      return res.status(400).json({ message: "short is not found" });
    }

    const comment = short.comments.id(commentId);
    if (!comment) {
      return res.status(400).json({ message: "comment is not found" });
    }

    // ✅ push reply
    comment.replies.push({
      author: userId,
      message,
    });

    // ✅ FIRST save
    await short.save();

    // ✅ THEN populate
    await short.populate("comments.author", "userName photoUrl");
    await short.populate("comments.replies.author", "userName photoUrl");
    await short.populate("channel");

    return res.status(200).json(short);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: `Error adding reply ${error.message}` });
  }
};

export const getLikedshorts = async (req, res) => {
  try {
    const userId = req.userId;

    const likedShort = await Short.find({ likes: userId })
      .populate("channel", "name avatar")
      .populate("likes", "username");
    if (!likedShort) {
      return res.status(400).json({ message: "failed to get liked shorts" });
    }
    return res.status(200).json(likedShort);
  } catch (error) {
    return res.status(500).json({
      message: `Error to find liked Shorts ${error}`,
    });
  }
};

export const getSavedshorts = async (req, res) => {
  try {
    const userId = req.userId;

    const SavedShort = await Short.find({ savedBy: userId })
      .populate("channel", "name avatar")
      .populate("likes", "username");
    if (!SavedShort) {
      return res.status(400).json({ message: "failed to get saved shorts" });
    }
    return res.status(200).json(SavedShort);
  } catch (error) {
    return res.status(500).json({
      message: `Error to find saved Shorts ${error}`,
    });
  }
};

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Channel from "../model/channelModel.js";
import Video from "../model/videoModel.js";
import Short from "../model/shortModel.js";
import Playlist from "../model/playlistModel.js";

dotenv.config();

/* ================= SEARCH WITH AI ================= */
export const searchWithAi = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are a search assistant for a video streaming platform.
The user query is: "${input}"
- Fix typos
- Extract meaningful keywords
- Return only comma-separated keywords
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // ✅ FIX 1: Render-safe Gemini response
    const aiText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text;

    let keyword =
      aiText && aiText.trim().length > 0
        ? aiText.trim().replace(/[\n\r]+/g, "")
        : input;

    const searchWords = keyword
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);

    // ✅ FIX 2: Correct Mongo regex query
    const buildRegexQuery = (fields) => ({
      $or: searchWords.flatMap((word) =>
        fields.map((field) => ({
          [field]: { $regex: word, $options: "i" },
        }))
      ),
    });

    /* ================= CHANNELS ================= */
    const matchedChannels = await Channel.find(
      buildRegexQuery(["name"])
    ).select("_id name avatar");

    const channelIds = matchedChannels.map((c) => c._id);

    /* ================= VIDEOS ================= */
    const videos = await Video.find({
      $or: [
        buildRegexQuery(["title", "description"]),
        { tags: { $elemMatch: { $regex: keyword, $options: "i" } } }, // ✅ FIX 3
        { channel: { $in: channelIds } },
      ],
    }).populate("channel comments.author comments.replies.author");

    /* ================= SHORTS ================= */
    const shorts = await Short.find({
      $or: [
        buildRegexQuery(["title", "description"]),
        { tags: { $elemMatch: { $regex: keyword, $options: "i" } } }, // ✅ FIX 3
        { channel: { $in: channelIds } },
      ],
    })
      .populate("channel", "name avatar")
      .populate("likes", "username photoUrl");

    /* ================= PLAYLISTS ================= */
    const playlists = await Playlist.find({
      $or: [
        buildRegexQuery(["title", "description"]),
        { channel: { $in: channelIds } },
      ],
    })
      .populate("channel", "name avatar")
      .populate({
        path: "videos",
        populate: { path: "channel", select: "name avatar" },
      });

    return res.status(200).json({
      keyword,
      channels: matchedChannels,
      videos,
      shorts,
      playlists,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      message: `Failed to search: ${error.message}`,
    });
  }
};

/* ================= FILTER CATEGORY WITH AI ================= */
export const filterCategoryWithAi = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const categories = [
      "Music","Gaming","Movies","TV Shows","News","Trending",
      "Entertainment","Education","Science & Tech","Travel",
      "Fashion","Cooking","Sports","Pets","Art","Comedy","Vlogs"
    ];

    const prompt = `
Match this query with the most relevant categories:
${categories.join(", ")}

Query: "${input}"
Return only category names (comma-separated)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // ✅ FIX 4: Render-safe Gemini response
    const aiText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text;

    let keywords = aiText
      ? aiText.split(",").map(k => k.trim()).filter(Boolean)
      : [input];

    if (!keywords.length) keywords = [input];

    const videoConditions = [];
    const shortConditions = [];
    const channelConditions = [];

    keywords.forEach((kw) => {
      videoConditions.push(
        { title: { $regex: kw, $options: "i" } },
        { description: { $regex: kw, $options: "i" } },
        { tags: { $elemMatch: { $regex: kw, $options: "i" } } } // ✅ FIX 5
      );

      shortConditions.push(
        { title: { $regex: kw, $options: "i" } },
        { tags: { $elemMatch: { $regex: kw, $options: "i" } } } // ✅ FIX 5
      );

      channelConditions.push(
        { name: { $regex: kw, $options: "i" } },
        { category: { $regex: kw, $options: "i" } },
        { description: { $regex: kw, $options: "i" } }
      );
    });

    const videos = await Video.find({ $or: videoConditions })
      .populate("channel")
      .populate("comments.author comments.replies.author");

    const shorts = await Short.find({ $or: shortConditions })
      .populate("channel", "name avatar")
      .populate("likes", "username photoUrl");

    const channels = await Channel.find({ $or: channelConditions })
      .populate("owner", "username photoUrl")
      .populate("subscribers", "username photoUrl");

    return res.status(200).json({
      videos,
      shorts,
      channels,
      keywords,
    });

  } catch (error) {
    console.error("Filter error:", error);
    return res.status(500).json({
      message: `Failed to filter: ${error.message}`,
    });
  }
};

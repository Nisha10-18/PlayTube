import Channel from "../model/channelModel.js"
import Video from "../model/videoModel.js"
import Playlist from "../model/playlistModel.js"


export const CreatePlaylist = async (req,res) => {
    try {
        const {title,description , channelId, videoIds} = req.body

        if(!title || !channelId){
            return res.status(400).json({message:"to create playlist , title and channelId are required"})
        }

        const channel = await Channel.findById(channelId)
            if(!channel){
                return res.status(400).json({message:"channel is not found"})
            }

        const videos = await Video.find({
         _id : { $in: videoIds },
  channel:channelId
})

if (videos.length !== videoIds.length) {
  return res.status(400).json({ message: "Some videos are not found" })
}
 const playlist = await Playlist.create({
    title,
    description,
    channel:channelId,
    videos:videoIds
 })

 await Channel.findByIdAndUpdate(channelId , {
    $push : {playlists : playlist._id}
 })
 return res.status(201).json(playlist)
        
    } catch (error) {
       return res.status(400).json({ message: `Failed to create playlist ${error}`}) 
        
    }
}

export const toggleSavePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.body;
    const userId = req.userId;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist ) {
      return res.status(400).json({ message: "playlist  is not found" });
    }

    if (playlist.saveBy.includes(userId)) {
      playlist.saveBy.pull(userId);
    } else {
      playlist.saveBy.push(userId);
    }

    await playlist.save();
    return res.status(200).json(playlist);

  } catch (error) {
    return res.status(500).json({ message: `failed to save playlist ${error}` });
  }
}


export const getSavedPlaylist = async (req,res) => {
  try{
    const userId = req.userId

    const SavedPlaylist = await Playlist.find({saveBy : userId})
    .populate("videos")
    .populate({
      path:"videos",
      populate:{path: "channel" }
    });

    if(!SavedPlaylist){
      return res.status(400).json({message:"Failed to get saved Playlist"})
    }
    return res.status(200).json(SavedPlaylist)

  }catch(error){
    return res.status(500).json({message:`Error to find saved Playlist ${error}`})

  }
}

export const fetchPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId)
      .populate("channel", "name avatar")
      .populate({
        path: "videos",
        populate: {
          path: "channel",
          select: "name avatar",
        },
      });

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    return res.status(200).json(playlist);
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return res.status(500).json({
      message: "Error fetching playlist",
      error: error.message,
    });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { title, description, addVideos = [], removeVideos = [] } = req.body;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Update title & description
    if (title) playlist.title = title;
    if (description) playlist.description = description;

    // Add videos
    if (addVideos.length > 0) {
      playlist.videos.push(...addVideos.map(v => v.toString()));
      // Remove duplicates
      playlist.videos = [...new Set(playlist.videos)];
    }

    // Remove videos
    if (removeVideos.length > 0) {
      playlist.videos = playlist.videos.filter(
        vid => !removeVideos.includes(vid.toString())
      );
    }

    await playlist.save();

    return res.status(200).json({ playlist });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return res.status(500).json({
      message: "Error updating playlist",
      error: error.message,
    });
  }
};

//-----------------------DELETE-VIDEO--------------//
export const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({
        message: "Playlist not found",
      });
    }

    await Channel.findByIdAndUpdate(
      playlist.channel,
      {
        $pull: { playlists: playlist._id },
      }
    );

    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json({
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return res.status(500)
    .json({ message: "Error deleting playlist", error: error.message});
  }
};
import express from "express" 
import upload from "../middleware/multer.js"
import isAuth from "../middleware/isAuth.js"
import { addComment, addReply, createVideo, getAllVideos, getLikedVideos, getViews, toggleDislikes, toggleLikes, toggleSave ,getSavedVideos, updateVideo, fetchVideo,deleteVideo} from "../controller/videoController.js"

import {
  addComment1,
  addReply1,
  createShort,
  deleteShort,
  fetchShort,
  getAllShorts,
  getLikedshorts,
  getSavedshorts,
  getViews1,
  toggleDislikes1,
  toggleLikes1,
  toggleSave1,
  updateShort
} from "../controller/shortController.js";

import { toggleSavePlaylist,CreatePlaylist, getSavedPlaylist, updatePlaylist, deletePlaylist, fetchPlaylist} from "../controller/playlistController.js"
import { addCommentForPost, addReplyForPost, CreatePost, deletePost, getAllPosts, toggleLikesForPost } from "../controller/postController.js"
import { filterCategoryWithAi, searchWithAi } from "../controller/aiController.js";


const contentRouter = express.Router()

//Video Routes
contentRouter.post("/create-video" , isAuth , upload.fields([
    {name:"video",maxCount:1},
    {name:"thumbnail",maxCount:1}
]), createVideo)

contentRouter.get("/getallvideos",isAuth,getAllVideos)
contentRouter.put("/video/:videoId/toggle-like",isAuth,toggleLikes)
contentRouter.put("/video/:videoId/toggle-dislike",isAuth,toggleDislikes)
contentRouter.put("/video/:videoId/toggle-save",isAuth,toggleSave)
contentRouter.put("/video/:videoId/add-view",isAuth,getViews)
contentRouter.post("/video/:videoId/add-comment",isAuth,addComment)
contentRouter.post(
  "/video/:videoId/comment/:commentId/add-reply",
  isAuth,
  addReply
)
contentRouter.get("/likedvideo" , isAuth , getLikedVideos)
contentRouter.get("/savedvideo" , isAuth , getSavedVideos)

contentRouter.post("/updatevideo/:videoId" , isAuth , upload.single("thumbnail"),updateVideo)
contentRouter.delete("/deletevideo/:videoId",isAuth,deleteVideo)
contentRouter.get("/fetchvideo/:videoId",fetchVideo);

// Short Routes
contentRouter.post(
  "/create-short",
  isAuth,
  upload.single("shortUrl"),
  createShort
);

contentRouter.get("/getallshorts", isAuth, getAllShorts);
contentRouter.put("/short/:shortId/toggle-like", isAuth, toggleLikes1);
contentRouter.put("/short/:shortId/toggle-dislike", isAuth, toggleDislikes1);
contentRouter.put("/short/:shortId/toggle-save", isAuth, toggleSave1);
contentRouter.put("/short/:shortId/add-view", getViews1);
contentRouter.post("/short/:shortId/add-comment", isAuth, addComment1);
contentRouter.post(
  "/short/:shortId/comment/:commentId/add-reply",
  isAuth,
  addReply1
);
contentRouter.get("/likedshort" , isAuth , getLikedshorts)
contentRouter.get("/savedshort" , isAuth , getSavedshorts)

contentRouter.post("/updateshort/:shortId" , isAuth , updateShort)
contentRouter.delete("/deleteshort/:shortId",isAuth,deleteShort)
contentRouter.get("/fetchshort/:shortId",fetchShort);

// Playlist Routes
 contentRouter.post("/create-playlist", isAuth, CreatePlaylist)
 contentRouter.post("/playlist/toggle-save", isAuth, toggleSavePlaylist)
 contentRouter.get("/savedplaylist",isAuth,getSavedPlaylist)

 contentRouter.post("/updateplaylist/:playlistId" , isAuth , updatePlaylist)
 contentRouter.delete("/deleteplaylist/:playlistId",isAuth,deletePlaylist)
 contentRouter.get("/fetchplaylist/:playlisttId",fetchPlaylist);


 //Post-Routes

 contentRouter.post("/create-post",isAuth,upload.single("image"), CreatePost)
 contentRouter.get("/getPosts",getAllPosts)
 contentRouter.post("/post/toggle-like" , isAuth , toggleLikesForPost)
 contentRouter.post("/post/add-comment" , isAuth , addCommentForPost)
 contentRouter.post("/post/add-reply" , isAuth , addReplyForPost)
 contentRouter.delete("/deletepost/:postId",isAuth, deletePost)
 //ai route
 contentRouter.post("/search" , isAuth , searchWithAi);
contentRouter.post("/filter" , isAuth , filterCategoryWithAi);
export default contentRouter
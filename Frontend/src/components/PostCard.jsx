import axios from "axios";
import React, { useState } from "react"
import { FaHeart ,FaComment,FaReply,FaTimes, FaCommentsDollar  } from "react-icons/fa";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";
import { ClipLoader } from "react-spinners";


function PostCard({ post }) {
  const{userData} = useSelector(state=>state.user)
  const[liked,setLiked] = useState(post.likes?.some((u) => u.toString() === userData?._id?.toString()) ||false)
  const[likeCount,setLikeCount] = useState(post.likes?.length)
  const[showComments,setShowComments] = useState(false)
  const [newComment,setNewComment] = useState("")
  const [loading,setLoading] = useState(false)
  const [loading1,setLoading1] = useState(false)
  const [comments,setComments] = useState(post?.comments || [])

const handleLike = async () => {
  try {
    const result = await axios.post(`${serverUrl}/api/content/post/toggle-like`,
            {postId:post._id} , {withCredentials:true})
            setLikeCount(result.data.likes?.length)
            setLiked(result.data.likes.includes(userData?._id))
            console.log(result.data)
          
          
    
  } catch (error) {
    console.log(error)
    
  }
}

const handleAddComment = async () => {
    if(!newComment)return;
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/content/post/add-comment`,
        {message:newComment , postId:post?._id} , {withCredentials:true})
        setComments(prev=> [result.data?.comments.slice(-1)[0] , ...prev])
        console.log(result.data?.comments)
        setLoading(false)
        setNewComment("")
        
       } catch (error) {
        console.log(error)
        setLoading(false)
      
    }
  }



  const handleAddReply = async ({replyText,commentId}) => {
    if(!replyText)return;
    setLoading1(true)
    try {
      const result = await axios.post(`${serverUrl}/api/content/post/add-reply`,
        {message:replyText , postId:post?._id,commentId} , {withCredentials:true})
        setComments(result.data.comments)
        console.log(result.data?.comments)
        setLoading1(false)
       
        
       } catch (error) {
        console.log(error)
        setLoading1(false)
      
    }
  }



  return (
    <div className="w-100 bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded p-3 shadow-lg border border-gray-700 mb-150px relative">
      <p className="text-base text-gray-200">{post.content}</p>
        {post?.image && (
          <img
            src={post?.image}
            className="w-60 h-60 object-cover rounded-xl mt-4 shadow-md"
          />
        )}
        <div className='flex justify-between items-center mt-4 text-gray-400 text-sm'>
        <sapn>{new Date(post.createdAt).toDateString()}
        </sapn>
        <div className='flex gap-6'>
            <button
            className={`flex items-center gap-2 cursor-pointer transition ${
            liked ? "text-red-500" : "hover:text-red-40"}`}
             onClick={handleLike}><FaHeart/>{likeCount}</button>
             <button className='flex items-center gap-2 hover:text-blue-400
             cursor-pointer transition' onClick={()=>setShowComments(true)}><FaComment/></button>
        </div>

        </div>
      
 


    {showComments && (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md p-4 rounded-t-2xl border-t border-gray-700 max-h-[50%] overflow-y-auto space-y-2">
      <div className="flex items-center w-full justify-between py-[10px]">
        <h3 className="text-gray-300 font-semibold mb-2">Comments</h3>
        <button className="text-gray-400 hover:text-orange-500 transition" onClick={() => setShowComments(false)}>
          <FaTimes size={18}/>
        </button>
      </div>
      
<div className="flex gap-2 mt-3 items-center">
  <img
    src={userData?.photoUrl}
    alt="User"
    className="w-8 h-8 rounded-full"
  />

  <input
    type="text"
    onChange={(e)=>setNewComment(e.target.value)}
    value={newComment}
    className="flex-1 px-3 py-2 rounded bg-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
    placeholder="Add a comment..."
  />
  <button disabled={loading} className="px-4 py-2 bg-orange-600 rounded text-white text-sm hover:bg-orange-700"
  onClick={handleAddComment}>{loading?
  <ClipLoader size={20} color='black'/>:"Post"}
  </button>
</div>

<div className='space-y-3'>

 {comments.length > 0 ? (
  comments?.map((comment)=>(
    <div key={comment?._id} className='bg-gray-700 p-3 rounded-lg'>
   <div className="flex items-center gap-2 mb-1">
   <img src={comment?.author?.photoUrl} alt="" className='w-6
   h-6 rounded-full' />
   <span className='text-sm font-semibold text-gray-200'>{comment?.author?.userName}</span>
   </div>
   <p className='text-gray-200 ml-8'>{comment?.message}</p>

   <div className='ml-4 mt-2 space-y-2'>
      {
        comment?.replies.map((reply)=>(
          <div key={reply._id} className="p-2 bg-[#2a2a2a] rounded">
          <div className ='flex items-center justify-start gap-1'>
            <img src={reply?.author.photoUrl} className='w-6 h-6 rounded-full object-cover' alt="" />
            <h2 className='text-[13px]'>{reply?.author?.userName}</h2>
            <p className='px-[20px] py-[20px]'>{reply?.message}</p>
          </div>
          
          </div>

        ))
      }
      </div>
      

   <ReplySection comment={comment} handleReply={handleAddReply}
   loading1={loading1} />

    </div>
  ))
 )
     


     :(

    <p className='text-gray-500 text-sm'>No Comments yet</p>)}


</div>

    </div>
  )
}



</div>
  )}


  const ReplySection = ({ comment, handleReply,loading1}) => {
    const [replyText, setReplyText] = useState("");
    const [showReplyInput, setShowReplyInput] = useState(false);
  
    return (
      <div className="mt-3">
        {showReplyInput &&  
          <div className="flex gap-2 mt-1 ml-4">
            <input
              type="text"
              placeholder="Add a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 border border-gray-700 bg-[#1a1a1a] text-white rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-orange-600 text-sm"
            />
            <button onClick={()=>{handleReply({commentId:comment._id, replyText:replyText}); setShowReplyInput(false) ;
             setReplyText("")}} disabled={loading1} className='bg-orange-600 hover:bg-orange-700 text-white px-3 rounded-lg text-sm'>{loading1?<ClipLoader size={20} color='black' />:"Reply"}</button>
          </div>}
  
          <button onClick={()=>setShowReplyInput(!showReplyInput)} className='ml-4 text-xs text-gray-400 mt-1'>reply</button>
  
  
        
      </div>
    );
  };
 
  

export default PostCard
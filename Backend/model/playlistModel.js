import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
   
},
message:{
    type:String
},

createdAt:{ type: Date, default:Date.now},
updatedAt: { type: Date }

},{_id:true})

const commentSchema =  new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
   
},
message:{
    type:String,
    required:true
},
replies:[replySchema],
createdAt:{ type: Date, default:Date.now},
updatedAt: { type: Date }

},{_id:true})


const playlistSchema = new mongoose.Schema({
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Channel",
        required:true
    },
    title:{
        type:String,
        default:""
    },
    description:{
        type:String,
        default:""
    },
    videos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
   
    
    saveBy:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }],
 

},{timestamps:true})

const Playlist = mongoose.model("Playlist",playlistSchema)

export default Playlist
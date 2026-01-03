import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true, // email same nhi hona chahiye
    },
    password:{
        type:String
        //Password wagerah nhi denge google authentication krenge
    },
    photoUrl:{
        //Sign up ke liye use hoga
        type:String,
        default:""
    },
    channel:{ //user ka channel bhi hoga
        //dusre model se reference lene ke liye aise likhte hai
        type:mongoose.Schema.Types.ObjectId,
        ref:"Channel" //
    },


    history: [
        {
            contentId: {
                type: mongoose.Schema.Types.ObjectId,
                refPath: "history.contentType" //dynamically decide karega Video ya Short
            },
            contentType: {
                type: String,
                enum: ["Video", "Short"],
                required: true
            },
            watchedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    
    resetOtp: { type: String },
    otpExpires: { type: Date},
    isOtpVerified: { type: Boolean, default: false },
},{timestamps:true})

const User = mongoose.model("User",userSchema)

export default User
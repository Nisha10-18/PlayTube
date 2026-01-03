import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../model/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";
import sendMail from "../config/sendMail.js";

/* ================= SIGN UP ================= */
export const signUp = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    let photoUrl = null;
    if (req.file) {
      photoUrl = await uploadOnCloudinary(req.file.path);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      password: hashPassword,
      photoUrl,
    });

    let token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict", // 🔥 FIXED
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    return res.status(201).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `SignUp error: ${error.message}` });
  }
};

/* ================= SIGN IN ================= */
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

   let token = await genToken(user?._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict", // 🔥 FIXED
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `SignIn error: ${error.message}` });
  }
};

/* ================= UPDATE PROFILE PHOTO ================= */
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const photoUrl = await uploadOnCloudinary(req.file.path);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { photoUrl },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= SIGN OUT ================= */
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "SignOut Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `SignOut error: ${error.message}` });
  }
};


export const googleAuth = async (req,res) => {
  try{
  const {userName, email,photoUrl} = req.body
  let googlePhoto = photoUrl

  if(photoUrl){
    try{
      googlePhoto = await uploadOnCloudinary(photoUrl)

    }catch(error){
      console.log("Cloudinary upload failed")
    }
  }

  const user = await User.findOne({email})
    if(!user){
      await User.create({
        userName,
        email,
        photoUrl:googlePhoto
      })
    }else{
      if(!user.photoUrl && googlePhoto){
        user.photoUrl = googlePhotoawait
         user.save()
      }
    }

     let token = await genToken(user?._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict", // 🔥 FIXED
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    
    return res.status(201).json(user);

  }catch(error) {
    return res.status(500)
      .json({ message: `GoogleAuth: error${error}` });

  }

}


export const sendOtp = async(req,res) => {
  try{
   const {email} = req.body
   const user = await User.findOne({email})
   if(!user){
    return res.status(400).json({message:"User is not Found"})
   }
   const otp = await Math.floor(1000 + Math.random()*9000).toString()
   user.resetOtp = otp
   user.otpExpires = Date.now() + 5*6*1000,
   user.isOtpVerified = false

   await user.save()
   await sendMail(email,otp)

   return res.status(200).json({message:"OTP send successfully"})
  }catch(error){
   return res.status(500).json({message:`Otp send error ${error}`})

  }
}

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (
      !user ||
      user.resetOtp !== otp ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid otp" });
    }

    user.resetOtp = undefined;
    user.otpExpires = undefined;
    user.isOtpVerified = true;

    await user.save();

    return res
      .status(200)
      .json({ message: "OTP verified successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Otp verification error ${error}` });
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "Otp verification required" })
    }

    const hashPassword = await bcrypt.hash(password, 10)
    user.password = hashPassword
    user.isOtpVerified = false
    await user.save()
    return res.status(200).json({message:"Password reset successfully"})
  } catch (error) {
    return res
      .status(500)
      .json({ message: ` Password reset error ${error}` });

  }
}
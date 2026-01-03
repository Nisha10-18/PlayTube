import express from "express";
import upload from "../middleware/multer.js";
import { signUp, signIn, signOut ,googleAuth,sendOtp,verifyOtp,resetPassword} from "../controller/authController.js";

const authRouter = express.Router();

// Make sure field name matches frontend FormData
authRouter.post("/signup", upload.single("photoUrl"), signUp)
authRouter.post("/signin", signIn)
authRouter.get("/signout", signOut)
authRouter.post("/googleauth",upload.single("photoUrl"),googleAuth)
authRouter.post("/sendotp",sendOtp)
authRouter.post("/verifyotp",verifyOtp)
authRouter.post("/resetpassword",resetPassword)

export default authRouter;
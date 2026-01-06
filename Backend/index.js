import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./route/authRoute.js";
import userRouter from "./route/userRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import contentRouter from "./route/contentRoute.js";
dotenv.config(); //to use env file

const PORT = process.env.PORT; //to get env data

const app = express();
app.set("trust proxy", 1);

app.use(cookieParser())
app.use(express.json())

app.use(cors({
  origin:"https://playtube-7wpt.onrender.com",
  credentials:true
}))
//Creating API
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/content",contentRouter)

app.get("/", (req, res) => {
  res.send("Backend working on Render 🚀");
});


app.listen(PORT, () => {
  console.log("Server Started");
  connectDb();
});
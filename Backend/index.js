import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./route/authRoute.js";
import userRouter from "./route/userRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import contentRouter from "./route/contentRoute.js";
dotenv.config(); //to use env file
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const port = process.env.PORT; //to get env data

const app = express();
app.use(cookieParser())
app.use(express.json())

app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))
//Creating API
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/content",contentRouter)

app.listen(port, () => {
  console.log("Server Started");
  connectDb();
});
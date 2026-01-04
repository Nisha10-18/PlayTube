import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./route/authRoute.js";
import userRouter from "./route/userRoute.js";
import contentRouter from "./route/contentRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS setup
// ⚠️ Replace origin with your frontend deployed URL when on production
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Test root route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// API routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/content", contentRouter);

// Get port from env or default to 8000
const port = process.env.PORT || 8000;

// Connect to DB first, then start server
connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server Started on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed", err);
  });

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // New Auth Routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Mounting
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes); // Ensure this is exactly /api/auth

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Log:", err.stack);
  res.status(500).json({ message: "Intelligence Server Error", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Intelligence Server active on port ${PORT}`);
  console.log(`- Auth Endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`- Post Endpoints: http://localhost:${PORT}/api/posts`);
});

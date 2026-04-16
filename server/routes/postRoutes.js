import express from "express";
import multer from "multer";
import { createPost, getPosts, getPostById, downloadPostFile, deletePost, toggleLike } from "../controllers/postController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.get("/download/:id", downloadPostFile);
router.delete("/:id", deletePost);
router.post("/like", toggleLike); // New Like Route

export default router;

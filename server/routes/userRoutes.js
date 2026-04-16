import express from "express";
const router = express.Router();
import { getProfile, updateProfile } from "../controllers/userController.js";

router.get("/:id", getProfile);
router.post("/update", updateProfile);

export default router;

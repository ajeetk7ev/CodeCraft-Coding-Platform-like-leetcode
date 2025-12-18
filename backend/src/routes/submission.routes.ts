import express from "express";
import {
  runCode,
  submitCode,
  getSubmission,
  getUserSubmissions,
  getProblemSubmissions,
} from "../controllers/submission.controller";
import { protect } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";

const router = express.Router();

// Run code (public endpoint for testing)
router.post("/run", runCode);

// Submit code (protected)
router.post("/submit", protect, submitCode);

// Get user's submissions (protected)
router.get("/my-submissions", protect, getUserSubmissions);

// Get specific submission (protected)
router.get("/:id", protect, getSubmission);

// Get all submissions for a problem (admin only)
router.get("/problem/:problemId", protect, isAdmin, getProblemSubmissions);

export default router;


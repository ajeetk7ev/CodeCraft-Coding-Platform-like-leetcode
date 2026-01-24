import express from "express";
import {
  createDiscussion,
  getDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion,
  addComment,
  getComments,
  toggleVote,
} from "../controllers/discussion.controller";
import { protect, optionalProtect } from "../middlewares/auth.middleware";

const router = express.Router();

// Discussion routes
router.get("/", optionalProtect, getDiscussions);
router.post("/", protect, createDiscussion);
router.get("/:id", optionalProtect, getDiscussionById);
router.patch("/:id", protect, updateDiscussion);
router.delete("/:id", protect, deleteDiscussion);

// Comment routes
router.get("/:discussionId/comments", optionalProtect, getComments);
router.post("/:discussionId/comments", protect, addComment);

// Voting routes
router.post("/:targetId/vote", protect, toggleVote);

export default router;

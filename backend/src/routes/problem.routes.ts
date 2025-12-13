import express from "express";
import {
  createProblem,
  getProblems,
  getProblem,
  updateProblem,
  deleteProblem,
} from "../controllers/problem.controller";
import { protect } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";

const router = express.Router();

// Public routes
router.get("/", getProblems);
router.get("/:id", getProblem);

// Protected routes (admin only)
router.post("/", protect, isAdmin, createProblem);
router.put("/:id", protect, isAdmin, updateProblem);
router.delete("/:id", protect, isAdmin, deleteProblem);

export default router;


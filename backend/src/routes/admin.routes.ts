import express from "express";
import {
  getDashboardStats,
  getSubmissionsPerDay,
  getAcVsWaRatio,
  getMostSolvedProblems,
  getDifficultyDistribution,
  getAllUsers,
  toggleUserBan,
  assignUserRole,
  getUserStats,
  toggleProblemPublish,
} from "../controllers/admin.controller";
import { protect } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// Dashboard stats
router.get("/stats", getDashboardStats);
router.get("/stats/submissions-per-day", getSubmissionsPerDay);
router.get("/stats/ac-vs-wa", getAcVsWaRatio);
router.get("/stats/most-solved", getMostSolvedProblems);
router.get("/stats/difficulty-distribution", getDifficultyDistribution);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:userId/ban", toggleUserBan);
router.patch("/users/:userId/role", assignUserRole);
router.get("/users/:userId/stats", getUserStats);

// Problem management
router.patch("/problems/:problemId/publish", toggleProblemPublish);

export default router;
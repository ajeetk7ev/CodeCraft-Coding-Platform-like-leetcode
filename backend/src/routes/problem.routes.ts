import express from "express";
import {
  createProblem,
  getProblems,
  getProblem,
  updateProblem,
  deleteProblem,
  getAdminProblems,
  getProblemForAdmin,
  getProblemFilters
} from "../controllers/problem.controller";
import { protect, optionalProtect } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";

const router = express.Router();
router.get("/admin", protect, isAdmin, getAdminProblems);
router.get("/admin/:id", protect, isAdmin, getProblemForAdmin);
// Public routes
router.get("/param-filters", getProblemFilters);
router.get("/", optionalProtect, getProblems);
router.get("/:slug", protect, getProblem);

// Protected routes (admin only)

router.post("/", protect, isAdmin, createProblem);
router.put("/:id", protect, isAdmin, updateProblem);
router.delete("/:id", protect, isAdmin, deleteProblem);

export default router;


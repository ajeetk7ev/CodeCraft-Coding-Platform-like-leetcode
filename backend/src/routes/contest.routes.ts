import express from "express";
import {
    createContest,
    getContests,
    getContestById,
    joinContest,
    getContestLeaderboard,
    updateContest,
    deleteContest,
    virtualJoin,
    getContestSubmissions,
    finishContestAndCalculateRatings,
} from "../controllers/contest.controller";
import { protect } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";

const router = express.Router();

router.post("/", protect, isAdmin, createContest);
router.get("/", getContests);
router.get("/:id", getContestById);
router.post("/:id/join", protect, joinContest);
router.post("/:id/virtual-join", protect, virtualJoin);
router.get("/:id/submissions", protect, getContestSubmissions);
router.get("/:id/leaderboard", getContestLeaderboard);
router.post("/:id/finish", protect, isAdmin, finishContestAndCalculateRatings);
router.put("/:id", protect, isAdmin, updateContest);
router.delete("/:id", protect, isAdmin, deleteContest);

export default router;

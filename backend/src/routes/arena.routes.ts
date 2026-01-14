import { Router } from "express";
import { chatWithArena } from "../controllers/arena.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// POST /api/arena/chat
router.post("/chat", protect, chatWithArena);

export default router;

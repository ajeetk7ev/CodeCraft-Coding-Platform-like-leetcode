import express from "express";
import passport from "passport";
import { signup, login, googleCallback } from "../controllers/auth.controller";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

// Google Auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback,
);

export default router;

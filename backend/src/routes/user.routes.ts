import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { updatePreferences, getProfile, updateProfile } from '../controllers/user.controller';
const router = express.Router();



router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/preferences", protect, updatePreferences);


export default router;
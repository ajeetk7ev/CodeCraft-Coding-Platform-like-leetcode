import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { updatePreferences, getProfile, updateProfile, getStreak } from '../controllers/user.controller';
import { upload } from '../config/multer';
const router = express.Router();


router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single('avatar'), updateProfile);
router.put("/preferences", protect, updatePreferences);
router.get("/streak", protect, getStreak);


export default router;
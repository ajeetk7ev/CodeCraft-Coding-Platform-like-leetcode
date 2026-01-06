import express from 'express';
import { protect } from '../middlewares/auth.middleware';
import { updatePreferences } from '../controllers/user.controller';
const router = express.Router();



router.put("/preferences", protect, updatePreferences);


export default router;
import express from 'express';
import { updateStatus, getActiveHelpers } from '../controllers/helperController.js';
import { protect, helperOnly, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.put('/status', protect, helperOnly, updateStatus);
router.get('/active', protect, adminOnly, getActiveHelpers);

export default router;

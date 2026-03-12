import express from 'express';
import { triggerSOS, cancelSOS, resolveSOS, getHistory } from '../controllers/sosController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/trigger', protect, triggerSOS);
router.post('/cancel/:id', protect, cancelSOS);
router.post('/resolve/:id', protect, resolveSOS);
router.get('/history', protect, getHistory);

export default router;

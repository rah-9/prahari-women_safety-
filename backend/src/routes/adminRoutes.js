import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getAllUsers, deleteUser, addUser, getAllHelpers, verifyHelper, getAnalytics, seedDemoData } from '../controllers/adminController.js';

const router = express.Router();

router.route('/users')
  .get(protect, adminOnly, getAllUsers)
  .post(protect, adminOnly, addUser);
router.route('/users/:id').delete(protect, adminOnly, deleteUser);

router.route('/helpers').get(protect, adminOnly, getAllHelpers);
router.route('/helpers/:id/verify').put(protect, adminOnly, verifyHelper);
router.route('/analytics').get(protect, adminOnly, getAnalytics);
router.route('/seed').post(protect, adminOnly, seedDemoData);

export default router;

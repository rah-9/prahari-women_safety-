import Helper from '../models/Helper.js';
import User from '../models/User.js';
import SOSRequest from '../models/SOSRequest.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.deleteOne({ _id: req.params.id });
    await Helper.deleteOne({ userId: req.params.id });
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a new user manually
// @route   POST /api/admin/users
// @access  Private/Admin
export const addUser = async (req, res) => {
  try {
    const { name, email, phone, role, gender } = req.body;
    
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email/phone' });
    }

    const bcrypt = await import('bcrypt');
    const hash = await bcrypt.default.hash('prahari123', 10); // default password

    const user = await User.create({
      name, email, phone, role, gender, passwordHash: hash
    });

    if (role === 'helper') {
      await Helper.create({
        userId: user._id,
        currentLocation: { type: 'Point', coordinates: [0, 0] },
        verificationStatus: 'verified'
      });
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all helpers with their details
// @route   GET /api/admin/helpers
// @access  Private/Admin
export const getAllHelpers = async (req, res) => {
  try {
    const helpers = await Helper.find({}).populate('userId', '-passwordHash');
    res.json(helpers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Verify a helper
// @route   PUT /api/admin/helpers/:id/verify
// @access  Private/Admin
export const verifyHelper = async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id);
    if (!helper) {
      return res.status(404).json({ message: 'Helper not found' });
    }
    helper.verificationStatus = 'verified';
    await helper.save();
    res.json({ message: 'Helper verified successfully', helper });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalHelpers = await User.countDocuments({ role: 'helper' });
    const verifiedHelpers = await Helper.countDocuments({ verificationStatus: 'verified' });
    const onlineHelpers = await Helper.countDocuments({ isOnline: true });

    const totalSOS = await SOSRequest.countDocuments();
    const activeSOS = await SOSRequest.countDocuments({ status: 'active' });
    const assignedSOS = await SOSRequest.countDocuments({ status: 'helper_assigned' });
    const resolvedSOS = await SOSRequest.countDocuments({ status: 'resolved' });
    const cancelledSOS = await SOSRequest.countDocuments({ status: 'cancelled' });
    const expiredSOS = await SOSRequest.countDocuments({ status: 'expired' });

    // SOS per day for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sosPerDay = await SOSRequest.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Recent SOS logs
    const recentSOS = await SOSRequest.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email phone')
      .populate('helperAssigned', 'userId');

    res.json({
      stats: { totalUsers, totalHelpers, verifiedHelpers, onlineHelpers, totalSOS, activeSOS, assignedSOS, resolvedSOS, cancelledSOS, expiredSOS },
      sosPerDay,
      recentSOS,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Seed 5 demo SOS records for testing
// @route   POST /api/admin/seed
// @access  Private/Admin
export const seedDemoData = async (req, res) => {
  try {
    // Find any user to attach SOS records to
    let demoUser = await User.findOne({ role: 'user' });
    if (!demoUser) {
      // Create a demo user
      const bcrypt = await import('bcrypt');
      const hash = await bcrypt.default.hash('demo123', 10);
      demoUser = await User.create({ name: 'Demo Victim', email: 'demo@prahari.com', phone: '9999999999', passwordHash: hash, role: 'user' });
    }

    const statuses = ['resolved', 'resolved', 'cancelled', 'helper_assigned', 'resolved'];
    const cities = [
      [77.2090, 28.6139], // Delhi
      [72.8777, 19.0760], // Mumbai
      [80.2707, 13.0827], // Chennai
      [88.3639, 22.5726], // Kolkata
      [77.5946, 12.9716], // Bangalore
    ];

    const demoSOS = [];
    for (let i = 0; i < 5; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const created = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 86400000);
      demoSOS.push({
        userId: demoUser._id,
        location: { type: 'Point', coordinates: cities[i] },
        status: statuses[i],
        notifiedHelpers: [],
        expiresAt: new Date(created.getTime() + 120000),
        resolvedAt: statuses[i] === 'resolved' ? new Date(created.getTime() + 60000 + Math.random() * 120000) : undefined,
        createdAt: created,
        updatedAt: created,
      });
    }

    await SOSRequest.insertMany(demoSOS);
    res.json({ message: `Seeded ${demoSOS.length} demo SOS records.` });
  } catch (error) {
    res.status(500).json({ message: 'Seed failed', error: error.message });
  }
};

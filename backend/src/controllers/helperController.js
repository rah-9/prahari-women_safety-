import Helper from '../models/Helper.js';

// @desc    Toggle helper availability status
// @route   PUT /api/helpers/status
// @access  Private (Helper)
export const updateStatus = async (req, res) => {
  try {
    const { availabilityStatus } = req.body;
    
    const helper = await Helper.findOneAndUpdate(
      { userId: req.user._id },
      { availabilityStatus },
      { new: true }
    );
    
    if (!helper) {
      return res.status(404).json({ message: 'Helper profile not found' });
    }
    
    res.json(helper);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

// @desc    Get active helpers (Admin/Testing)
// @route   GET /api/helpers/active
// @access  Private (Admin)
export const getActiveHelpers = async (req, res) => {
  try {
    const helpers = await Helper.find({
      availabilityStatus: true,
      verificationStatus: 'verified'
    }).populate('userId', 'name email phone');
    
    res.json(helpers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

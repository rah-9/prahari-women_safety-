import SOSRequest from '../models/SOSRequest.js';
import { triggerSOSMatch } from '../services/matchingService.js';

// @desc    Trigger a new SOS event
// @route   POST /api/sos/trigger
// @access  Private (User)
export const triggerSOS = async (req, res) => {
  try {
    const { lng, lat } = req.body;
    
    // Validate inputs
    if (lng === undefined || lat === undefined) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }

    const { sos, helpersToNotify } = await triggerSOSMatch(req.user._id, lng, lat);
    
    // Using req.app.get('io') to broadcast the alert
    const io = req.app.get('io');
    
    // Notify specifically those helpers
    helpersToNotify.forEach(helper => {
      // helper.userId is populated in matchingService if needed, else it is an ID
      const helperSocketRoom = helper.userId._id ? helper.userId._id.toString() : helper.userId.toString();
      io.to(helperSocketRoom).emit('sos:alert', {
        sosId: sos._id,
        location: { lng, lat },
        userId: req.user._id,
        timestamp: sos.createdAt
      });
    });

    res.status(201).json({ message: 'SOS Triggered successfully', sos });
  } catch (error) {
    res.status(500).json({ message: 'Failed to trigger SOS', error: error.message });
  }
};

// @desc    Cancel an active SOS
// @route   POST /api/sos/cancel/:id
// @access  Private
export const cancelSOS = async (req, res) => {
  try {
    const sos = await SOSRequest.findById(req.params.id);
    
    if (!sos) {
      return res.status(404).json({ message: 'SOS not found' });
    }
    
    if (sos.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this SOS' });
    }

    sos.status = 'cancelled';
    sos.resolvedAt = Date.now();
    await sos.save();
    
    // Notify room that it is cancelled
    const io = req.app.get('io');
    io.to(sos._id.toString()).emit('sos:cancelled', { sosId: sos._id });

    res.json({ message: 'SOS cancelled successfully', sos });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel SOS', error: error.message });
  }
};

// @desc    Mark an active SOS as resolved
// @route   POST /api/sos/resolve/:id
// @access  Private (User)
export const resolveSOS = async (req, res) => {
  try {
    const sos = await SOSRequest.findById(req.params.id);
    
    if (!sos) {
      return res.status(404).json({ message: 'SOS not found' });
    }
    
    if (sos.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to resolve this SOS' });
    }

    sos.status = 'resolved';
    sos.resolvedAt = Date.now();
    await sos.save();
    
    // Notify room that it is resolved
    const io = req.app.get('io');
    io.to(sos._id.toString()).emit('sos:resolved', { sosId: sos._id });

    res.json({ message: 'SOS resolved successfully', sos });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve SOS', error: error.message });
  }
};

// @desc    Get SOS History for User
// @route   GET /api/sos/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const history = await SOSRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('helperAssigned', 'name phone');
      
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get history', error: error.message });
  }
};

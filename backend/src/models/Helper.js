import mongoose from 'mongoose';

const helperSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'verified' },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  availabilityStatus: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

// Create the 2dsphere index for geolocation queries
helperSchema.index({ currentLocation: "2dsphere" });

export default mongoose.model('Helper', helperSchema);

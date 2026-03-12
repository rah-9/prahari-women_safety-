import mongoose from 'mongoose';

const sosRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  status: { type: String, enum: ['active', 'helper_assigned', 'resolved', 'cancelled', 'expired'], default: 'active' },
  helperAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', default: null },
  notifiedHelpers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Helper' }],
  expiresAt: { type: Date, required: true },
  resolvedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('SOSRequest', sosRequestSchema);

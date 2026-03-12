import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relationship: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('EmergencyContact', emergencyContactSchema);

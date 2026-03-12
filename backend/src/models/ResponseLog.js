import mongoose from 'mongoose';

const responseLogSchema = new mongoose.Schema({
  sosId: { type: mongoose.Schema.Types.ObjectId, ref: 'SOSRequest', required: true },
  helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', required: true },
  responseTimeSecs: { type: Number },
  status: { type: String, enum: ['accepted', 'rejected', 'completed', 'failed'], required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('ResponseLog', responseLogSchema);

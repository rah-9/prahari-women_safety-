import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'helper', 'admin'], default: 'user' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);

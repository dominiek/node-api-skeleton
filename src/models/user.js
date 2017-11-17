
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  email: { type: String, required: true, min: 3 },
  username: { type: String, required: true, min: 3 },
  name: { type: String },
  hash: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['user', 'admin'] },
  resetPasswordToken: { type: String },
});

export default mongoose.models.User || mongoose.model('User', schema);

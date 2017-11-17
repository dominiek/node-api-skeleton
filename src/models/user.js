
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  email:      String,
  username:   String,
  name:       String,
  apiKey:     String,
  hash:       String,
  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now }
});

export default mongoose.model('User', schema);

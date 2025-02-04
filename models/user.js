import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['climber', 'manager'], default: 'climber' },
  image: { type: String, default: '' },
});

export default mongoose.model('User', UserSchema);

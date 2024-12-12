import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  description: { type: String, required: true },
  difficultyLevel: { type: String },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym' },
  uploadDate: { type: Date, default: Date.now },
  likesCount: { type: Number, default: 0 },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
});

export default mongoose.model('Video', VideoSchema);

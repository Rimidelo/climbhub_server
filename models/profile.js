import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  uploadedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  preferredStyles: [String],
  gyms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym' }],
});

export default mongoose.model('Profile', ProfileSchema);

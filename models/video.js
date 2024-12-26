// models/Video.js

import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    difficultyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], required: true },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    videoUrl: { type: String, required: true },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: { type: Number, default: 0 },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: true }
);

// Middleware to keep likesCount in sync with likes array
VideoSchema.pre('save', function (next) {
  this.likesCount = this.likes.length;
  next();
});

export default mongoose.model('Video', VideoSchema);

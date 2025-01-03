import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    gradingSystem: {
      type: String,
      enum: ['V-Grading', 'Japanese-Colored'], // Specifies the grading system
      required: true,
    },
    difficultyLevel: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          if (this.gradingSystem === 'V-Grading') {
            return ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10'].includes(value);
          }
          if (this.gradingSystem === 'Japanese-Colored') {
            return ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Red', 'Black','Pink','Light Green','Cyan'].includes(value);
          }
          return false;
        },
        message: (props) => `${props.value} is not a valid difficulty level for the selected grading system.`,
      },
    },
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

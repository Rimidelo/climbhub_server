import mongoose from 'mongoose';

const GymSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
});

export default mongoose.model('Gym', GymSchema);

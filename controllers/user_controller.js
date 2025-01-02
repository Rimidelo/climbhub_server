// controllers/userController.js
import User from '../models/user.js';
import { uploadImageToGCP } from '../utils/gcp.js'; // Use a specific function for image uploads

export const uploadProfileImage = async (req, res) => {
  try {
    // If you're using authentication middleware, retrieve userId from req.user
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload the image to GCP
    const imageUrl = await uploadImageToGCP(file);

    // Update user's profile image
    const user = await User.findByIdAndUpdate(
      userId,
      { image: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile image uploaded successfully', user });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

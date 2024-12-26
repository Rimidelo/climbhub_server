// controllers/profile_controller.js
import Profile from '../models/profile.js';

// Create a new profile
export const createProfile = async (req, res) => {
    try {
        const { user, skillLevel, gyms } = req.body;

        // Validate required fields
        if (!user) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const newProfile = new Profile({
            user,
            skillLevel,
            gyms,
        });

        const savedProfile = await newProfile.save();
        res.status(201).json(savedProfile);
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get a profile by ID
export const getProfile = async (req, res) => {
    const { id } = req.params;
    
    try {
        const profile = await Profile.findOne({ user: id })
            .populate('user', 'username email') // Adjust fields as necessary
            .populate('gyms', 'name location'); // Adjust fields as necessary

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found for the given user.' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile by user ID:', error);
        res.status(500).json({ error: 'Server error while fetching profile.' });
    }
};

// Update a profile by ID
export const updateProfile = async (req, res) => {
    try {
        const updatedProfile = await Profile.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(updatedProfile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ error: 'Invalid data' });
    }
};

// Delete a profile by ID
export const deleteProfile = async (req, res) => {
    try {
        const deletedProfile = await Profile.findByIdAndRemove(req.params.id);

        if (!deletedProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

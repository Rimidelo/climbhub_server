// controllers/profile_controller.js
import Profile from '../models/profile.js';
import User from '../models/user.js';


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
            .populate('user', 'name email image')
            .populate('gyms', 'name location')
            .populate({
                path: 'savedVideos',
                populate: [
                    {
                        path: 'profile',
                        populate: { path: 'user', select: 'name email image skillLevel' },
                    },
                    {
                        path: 'gym',
                        select: 'name location',
                    },
                ],
            });

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

export const searchProfiles = async (req, res) => {
    try {
        const { q } = req.query; // e.g., ?q=alex
        if (!q) {
            return res.status(200).json([]);
        }

        // Find users whose "name" matches (case-insensitive)
        const matchedUsers = await User.find({
            name: { $regex: q, $options: 'i' },
        }).select('_id');

        const matchedUserIds = matchedUsers.map((user) => user._id);

        // Find profiles where either:
        // - the skillLevel matches the search term (as a regex), OR
        // - the profile.user is in the array of matchedUserIds
        const matchedProfiles = await Profile.find({
            $or: [
                { skillLevel: { $regex: q, $options: 'i' } },
                { user: { $in: matchedUserIds } },
            ],
        })
            .populate('user', 'name email image')
            .populate('gyms', 'name location');

        return res.json(matchedProfiles);
    } catch (error) {
        console.error('Error searching profiles:', error);
        return res.status(500).json({ error: 'Server error while searching profiles' });
    }
};
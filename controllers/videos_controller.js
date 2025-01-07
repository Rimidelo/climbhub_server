// controllers/video_controller.js
import Video from '../models/video.js';
import Comment from '../models/comment.js';
import Profile from '../models/profile.js'
import { uploadToGCP } from '../utils/gcp.js'; // We'll define this function later
// or wherever you keep your GCP logic

// Controller to handle the video upload
export const uploadVideo = async (req, res) => {
  try {
    const { description, gradingSystem, difficultyLevel, gym, profile } = req.body;

    // The file is attached by Multer. If using GCP, we might handle differently.
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No video file uploaded.' });
    }

    // 1) Upload the file to Google Cloud Storage (returns a public URL)
    const videoUrl = await uploadToGCP(file);

    // 2) Create a new Video document in MongoDB
    const newVideo = await Video.create({
      description,
      gradingSystem, // Include grading system
      difficultyLevel,
      gym: gym || null,
      profile,
      videoUrl, // Store the URL we got from GCP
    });

    return res.status(201).json({
      message: 'Video uploaded successfully.',
      video: newVideo,
    });
  } catch (err) {
    console.error('Error uploading video:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};


// GET all videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate({
        path: 'profile',
        populate: {
          path: 'user',
          select: 'name email image skillLevel', // Populate the 'user' field with 'name' and 'email'
        },
      })
      .populate('gym', 'name location'); // Populate gym name and location fields

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Server error' });
  }
};



// Like or Unlike a video
export const likeVideo = async (req, res) => {
  const { videoId } = req.params;
  const { userId } = req.body; // Get userId from request body

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if the user has already liked the video
    if (video.likes.includes(userId)) {
      // Unlike the video
      video.likes.pull(userId);
      video.likesCount = video.likes.length;
      await video.save();
      return res.json({ message: 'Video unliked', likesCount: video.likesCount });
    } else {
      // Like the video
      video.likes.push(userId);
      video.likesCount = video.likes.length;
      await video.save();
      return res.json({ message: 'Video liked', likesCount: video.likesCount });
    }
  } catch (error) {
    console.error('Error liking/unliking video:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a comment to a video
export const addComment = async (req, res) => {
  const { videoId } = req.params;
  const { text, userId } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Find the user's profile
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const comment = await Comment.create({
      video: videoId,
      profile: profile._id,
      text: text.trim(),
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const getComments = async (req, res) => {
  const { videoId } = req.params;

  try {
    // Ensure the video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Fetch and populate comments
    const comments = await Comment.find({ video: videoId })
      .populate({
        path: 'profile',
        select: 'user', // Include the 'user' reference from Profile
        populate: {
          path: 'user',
          select: 'name email image skillLevel', // Include name (username equivalent) and email from User
        },
      });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const getVideosByProfile = async (req, res) => {
  const { profileId } = req.params;

  try {
    const videos = await Video.find({ profile: profileId })
      .populate({
        path: 'profile',
        populate: {
          path: 'user',
          select: 'name email image skillLevel',
        },
      })
      .populate('gym', 'name location');

    return res.status(200).json(videos); // OK to return an empty array if none
  } catch (error) {
    console.error('Error fetching videos by profile:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteVideo = async (req, res) => {
  const { videoId } = req.params;

  try {
    // Find and delete the video
    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Optional: Remove associated comments
    await Comment.deleteMany({ video: videoId });

    // Optional: Remove the video file from storage (if using GCP or other storage solutions)
    // Note: Ensure you have the logic in your utils to handle file deletion
    // await deleteFromGCP(video.videoUrl);

    return res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getVideosByPreferences = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user profile
    const profile = await Profile.findOne({ user: userId }).populate('gyms');
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Map skill levels to difficulty ranges
    const skillLevelMapping = {
      beginner: { VGrading: ['V0', 'V1', 'V2', 'V3'], colors: ['Pink', 'Red', 'Yellow', 'Green'] },
      intermediate: { VGrading: ['V4', 'V5', 'V6', 'V7'], colors: ['Blue', 'White', 'Cyan', 'Orange'] },
      advanced: { VGrading: ['V8', 'V9', 'V10'], colors: ['Brown', 'Light Green', 'Black'] },
    };

    const { VGrading, colors } = skillLevelMapping[profile.skillLevel] || {};

    const preferredVideos = await Video.find({
      $or: [
        // Matches videos with correct grading system and difficulty levels and a matching gym
        {
          $and: [
            { difficultyLevel: { $in: VGrading }, gradingSystem: 'V-Grading' },
            { gym: { $in: profile.gyms.map((gym) => gym._id) } },
          ],
        },
        {
          $and: [
            { difficultyLevel: { $in: colors }, gradingSystem: 'Japanese-Colored' },
            { gym: { $in: profile.gyms.map((gym) => gym._id) } },
          ],
        },
        // Matches videos with correct grading system and difficulty levels, regardless of gym
        {
          difficultyLevel: { $in: VGrading },
          gradingSystem: 'V-Grading',
        },
        {
          difficultyLevel: { $in: colors },
          gradingSystem: 'Japanese-Colored',
        },
        // Matches videos where only the gym matches
        {
          gym: { $in: profile.gyms.map((gym) => gym._id) },
        },
      ],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'profile',
        populate: { path: 'user', select: 'name email image skillLevel' },
      })
      .populate('gym', 'name location');



    // Fetch other videos
    const otherVideos = await Video.find({
      _id: { $nin: preferredVideos.map((video) => video._id) }, // Exclude preferred videos
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'profile',
        populate: { path: 'user', select: 'name email image skillLevel' },
      })
      .populate('gym', 'name location');

    // Combine and return results
    res.status(200).json({ preferredVideos, otherVideos });
  } catch (error) {
    console.error('Error fetching videos by preferences:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getVideosByGym = async (req, res) => {
  const { gymId } = req.params;

  try {
    const videos = await Video.find({ gym: gymId })
      .populate({
        path: 'profile',
        populate: { path: 'user', select: 'name email image skillLevel' },
      })
      .populate('gym', 'name location');

    if (!videos || videos.length === 0) {
      return res.status(404).json({ message: 'No videos found for this gym.' });
    }

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos for gym:', error);
    res.status(500).json({ error: 'Server error' });
  }
};






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
          select: 'name email image', // Populate the 'user' field with 'name' and 'email'
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
          select: 'name email', // Include name (username equivalent) and email from User
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
          select: 'name email image', // Populate the 'user' field with 'name' and 'email'
        },
      })
      .populate('gym', 'name location'); // Populate gym name and location fields

    if (!videos.length) {
      return res.status(404).json({ error: 'No videos found for this profile.' });
    }

    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos by profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

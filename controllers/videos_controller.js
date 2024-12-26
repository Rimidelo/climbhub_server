// controllers/video_controller.js
import Video from '../models/video.js';
import { uploadToGCP } from '../utils/gcp.js'; // We'll define this function later
// or wherever you keep your GCP logic

// Controller to handle the video upload
export const uploadVideo = async (req, res) => {
  try {
    const { description, difficultyLevel, gym, profile } = req.body;

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
      difficultyLevel,
      gym: gym || null,
      profile,
      videoUrl, // store the URL we got from GCP
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
    const videos = await Video.find().populate('profile');
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
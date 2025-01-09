import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { config } from 'dotenv';
import authRoutes from './routes/auth_routes.js';
import profileRoutes from './routes/profile_routes.js';
import videoRoutes from './routes/video_routes.js'
import gymRoutes from './routes/gym_routes.js';
import userRoutes from './routes/user_routes.js';


config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/videos', videoRoutes);
app.use('/gyms', gymRoutes);
app.use('/users', userRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Define routes

app.listen(PORT, () => {
    console.log(`Server is running on port ${ PORT }`);
});

app.get('/', (req, res) => {
    res.send('Hello, ClimbHub!');
});


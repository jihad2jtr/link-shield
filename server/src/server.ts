import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/link-shepherd';

// Middleware
app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth';
app.use('/api/auth', authRoutes);

import linkRoutes from './routes/links';
app.use('/api/links', linkRoutes);



import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

import reportRoutes from './routes/reports';
app.use('/api/reports', reportRoutes);

import userRoutes from './routes/users';
app.use('/api/users', userRoutes);

import sessionRoutes from './routes/sessions';
app.use('/api/sessions', sessionRoutes);

import adRoutes from './routes/ads';
app.use('/api/advertisements', adRoutes);

import settingsRoutes from './routes/settings';
app.use('/api/settings', settingsRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('Link Shepherd API is running');
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

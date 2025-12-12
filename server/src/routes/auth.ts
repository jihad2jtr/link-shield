import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { verifyRecaptcha } from '../middleware/recaptcha';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register with reCAPTCHA verification
router.post('/signup', verifyRecaptcha, async (req: Request, res: Response) => {
    try {
        const { email, password, data } = req.body; // Supabase sends additional data in 'data' object
        const full_name = data?.full_name;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: { message: 'User already exists' } });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            email,
            password: hashedPassword,
            full_name,
            role: 'user' // Default role
        });

        await newUser.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            data: {
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    user_metadata: { full_name: newUser.full_name },
                    app_metadata: { role: newUser.role }
                },
                session: { access_token: token }
            },
            error: null
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Login with reCAPTCHA verification
router.post('/token', verifyRecaptcha, async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: { message: 'Invalid credentials' } });
        }

        const isMatch = await bcrypt.compare(password, user.password!);
        if (!isMatch) {
            return res.status(400).json({ error: { message: 'Invalid credentials' } });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        res.json({
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    user_metadata: { full_name: user.full_name },
                    app_metadata: { role: user.role }
                },
                session: { access_token: token }
            },
            error: null
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Get User (Me)
router.get('/user', async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: { message: 'No token provided' } });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: { message: 'User not found' } });
        }

        res.json({
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    user_metadata: { full_name: user.full_name },
                    app_metadata: { role: user.role }
                }
            },
            error: null
        });
    } catch (error) {
        res.status(401).json({ error: { message: 'Invalid token' } });
    }
});

// Google OAuth Sign-In
router.post('/google', async (req: Request, res: Response) => {
    try {
        const { access_token } = req.body;

        if (!access_token) {
            return res.status(400).json({ error: { message: 'Access token required' } });
        }

        // Get user info from Google
        const userInfoResponse = await fetch(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
        );

        if (!userInfoResponse.ok) {
            return res.status(401).json({ error: { message: 'Invalid Google token' } });
        }

        const googleUser = await userInfoResponse.json();
        const { email, name, sub: googleId } = googleUser;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = new User({
                email,
                full_name: name,
                google_id: googleId,
                role: 'user',
                // No password for Google OAuth users
            });
            await user.save();
        } else if (!user.google_id) {
            // Link Google account to existing user
            user.google_id = googleId;
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        res.json({
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    user_metadata: { full_name: user.full_name },
                    app_metadata: { role: user.role }
                },
                session: { access_token: token }
            },
            token, // Also send token directly for easier access
            error: null
        });
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

export default router;
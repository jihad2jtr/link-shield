import express from 'express';
import { UserSession } from '../models/UserSession';
import { Request, Response } from 'express';

const router = express.Router();

// Track Session (Upsert)
router.post('/track', async (req: Request, res: Response) => {
    try {
        const { sessionId, userAgent, browserInfo, cookiesData, referrer, deviceType, screenResolution, userId } = req.body;

        let session = await UserSession.findOne({ session_id: sessionId });

        if (session) {
            session.page_views += 1;
            session.last_activity = new Date();
            if (userId) session.user_id = userId;
            await session.save();
        } else {
            session = new UserSession({
                session_id: sessionId,
                user_id: userId,
                user_agent: userAgent,
                browser_info: browserInfo,
                cookies_data: cookiesData,
                referrer: referrer,
                device_type: deviceType,
                screen_resolution: screenResolution
            });
            await session.save();
        }

        res.json({ data: session, error: null });
    } catch (error) {
        console.error('Session track error:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// List all sessions (Admin)
router.get('/', async (req: Request, res: Response) => {
    try {
        // Fetch sessions with limited fields usually, but here all
        // Also need to join with User if possible or fetch separately (Mongoose populate)
        const sessions = await UserSession.find().sort({ last_activity: -1 }).limit(100).populate('user_id', 'email full_name');

        // Transform to match frontend expectation (profiles instead of user_id object)
        const data = sessions.map(s => {
            const doc = s.toObject();
            return {
                ...doc,
                id: doc._id,
                // populate puts user object in user_id field
                profiles: doc.user_id ? {
                    email: (doc.user_id as any).email,
                    full_name: (doc.user_id as any).full_name
                } : null,
                user_id: doc.user_id ? (doc.user_id as any)._id : null // keep user_id as string if needed, or just rely on profiles
            };
        });

        res.json({ data, error: null });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Get User Sessions
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const sessions = await UserSession.find({ user_id: userId }).sort({ last_activity: -1 }).limit(10);
        res.json({ data: sessions.map(s => ({ ...s.toObject(), id: s._id })), error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

export default router;
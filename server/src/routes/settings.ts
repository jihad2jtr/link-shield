import express from 'express';
import { SiteSettings } from '../models/SiteSettings';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user: any) => {
        if (err) return res.sendStatus(403);
        if (user.role !== 'admin') return res.sendStatus(403);
        (req as any).user = user;
        next();
    });
};

// Get site settings (public for AdSense display)
router.get('/', async (req: Request, res: Response) => {
    try {
        let settings = await SiteSettings.findOne();

        if (!settings) {
            // Create default settings if none exist
            settings = new SiteSettings({
                adsense_client_id: '',
                adsense_timer_slot: '',
                adsense_ad_slot: '',
                adsense_enabled: false
            });
            await settings.save();
        }

        res.json({ data: settings, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Update site settings (admin only)
router.put('/', requireAdmin, async (req: Request, res: Response) => {
    try {
        const { adsense_client_id, adsense_timer_slot, adsense_ad_slot, adsense_enabled } = req.body;

        let settings = await SiteSettings.findOne();

        if (!settings) {
            settings = new SiteSettings();
        }

        if (adsense_client_id !== undefined) settings.adsense_client_id = adsense_client_id;
        if (adsense_timer_slot !== undefined) settings.adsense_timer_slot = adsense_timer_slot;
        if (adsense_ad_slot !== undefined) settings.adsense_ad_slot = adsense_ad_slot;
        if (adsense_enabled !== undefined) settings.adsense_enabled = adsense_enabled;

        settings.updated_at = new Date();
        await settings.save();

        res.json({ data: settings, error: null });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

export default router;

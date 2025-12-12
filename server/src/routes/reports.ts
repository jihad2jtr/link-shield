import express from 'express';
import { Report } from '../models/Report';
import { ShortenedLink } from '../models/ShortenedLink';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Middleware to check auth and admin role
const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
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

// Create Report (Public)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { link_id, reporter_email, reason, description } = req.body;

        const newReport = new Report({
            link_id,
            reporter_email,
            reason,
            description
        });

        await newReport.save();
        res.status(201).json({ data: newReport, error: null });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// List Reports (Admin Only)
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const reports = await Report.find()
            .populate('link_id', 'short_code original_url title')
            .sort({ created_at: -1 });

        // Transform to match expected frontend structure if needed, or update frontend to read from populated field
        // Frontend expects 'shortened_links' property, populated field is 'link_id' based on schema.
        // We can map it here or update frontend. Let's map it to keep structure similar.
        const transformedReports = reports.map(r => ({
            ...r.toObject(),
            shortened_links: r.link_id,
            link_id: (r.link_id as any)?._id || r.link_id
        }));

        res.json({ data: transformedReports, error: null });
    } catch (error) {
        console.error('List reports error:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Update Report Status (Admin Only)
router.patch('/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, admin_response } = req.body;

        const updatedReport = await Report.findByIdAndUpdate(
            id,
            { status, admin_response, updated_at: new Date() },
            { new: true }
        );

        if (!updatedReport) {
            return res.status(404).json({ error: { message: 'Report not found' } });
        }

        res.json({ data: updatedReport, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

export default router;
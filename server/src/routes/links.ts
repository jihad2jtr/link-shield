import express from 'express';
import { ShortenedLink } from '../models/ShortenedLink';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Middleware to check auth (Optional for some routes)
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
        if (err) return res.sendStatus(403);
        (req as any).user = user;
        next();
    });
};

// Generate random short code
const generateShortCode = async (length = 6): Promise<string> => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check collision
    const existing = await ShortenedLink.findOne({ short_code: result });
    if (existing) {
        return generateShortCode(length);
    }

    return result;
}

router.get('/generate-code', async (req: Request, res: Response) => {
    try {
        const code = await generateShortCode();
        res.json({ data: code, error: null });
    } catch (e) {
        res.status(500).json({ error: { message: 'Failed to generate code' } });
    }
});

// Create Link
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { original_url, short_code, title, redirect_type } = req.body;

        // Validation
        if (!original_url) {
            return res.status(400).json({ error: { message: 'Original URL is required' } });
        }

        let finalShortCode = short_code;
        if (!finalShortCode) {
            finalShortCode = await generateShortCode();
        } else {
            // Check availability
            const existing = await ShortenedLink.findOne({ short_code: finalShortCode });
            if (existing) {
                return res.status(400).json({ error: { message: 'Short code already taken' } });
            }
        }

        const newLink = new ShortenedLink({
            original_url,
            short_code: finalShortCode,
            title,
            redirect_type,
            user_id: (req as any).user.userId,
            status: 'active'
        });

        await newLink.save();
        res.status(201).json({ data: newLink, error: null });
    } catch (error) {
        console.error('Create link error:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Get Link by Code (Public) - used for redirection
router.get('/:code', async (req: Request, res: Response) => {
    try {
        const { code } = req.params;
        const link = await ShortenedLink.findOne({ short_code: code });

        if (!link) {
            return res.status(404).json({ data: null, error: { message: 'Link not found' } });
        }

        res.json({ data: link, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// List User Links (Private)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const links = await ShortenedLink.find({ user_id: (req as any).user.userId }).sort({ created_at: -1 });
        res.json({ data: links, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Increment Clicks (Public/Internal)
router.post('/:id/click', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ShortenedLink.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
        res.json({ data: { success: true }, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Update Link
router.patch('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, original_url, status } = req.body;

        const link = await ShortenedLink.findOne({ _id: id, user_id: (req as any).user.userId });
        if (!link) return res.status(404).json({ error: { message: 'Link not found' } });

        if (title !== undefined) link.title = title;
        if (original_url !== undefined) link.original_url = original_url;
        if (status !== undefined) link.status = status;

        await link.save();
        res.json({ data: link, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Delete Link (Soft Delete)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Soft delete by setting status to 'deleted'
        const link = await ShortenedLink.findOneAndUpdate(
            { _id: id, user_id: (req as any).user.userId },
            { status: 'deleted' },
            { new: true }
        );

        if (!link) return res.status(404).json({ error: { message: 'Link not found' } });

        res.json({ data: { message: 'Link deleted successfully' }, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

export default router;
import express from 'express';
import multer from 'multer';
import path from 'path';
import { Advertisement } from '../models/Advertisement';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed') as any);
    }
});

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
        if (err) return res.sendStatus(403);
        (req as any).user = user;
        next();
    });
};

// Get Random Active Ad
router.get('/random', async (req: Request, res: Response) => {
    try {
        const count = await Advertisement.countDocuments({ is_active: true });
        if (count === 0) return res.json({ data: [], error: null });
        const random = Math.floor(Math.random() * count);
        const ad = await Advertisement.findOne({ is_active: true }).skip(random);
        // Return as array to match frontend expectation
        res.json({ data: ad ? [ad] : [], error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Get User Ads
router.get('/', authenticateUser, async (req: Request, res: Response) => {
    try {
        const ads = await Advertisement.find({ user_id: (req as any).user.userId }).sort({ created_at: -1 });
        res.json({ data: ads, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Create Ad (with image upload)
router.post('/', authenticateUser, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: { message: 'Image is required' } });
        }
        const { title, description, target_url } = req.body;

        // Construct image URL (assuming server runs on same host/port for now, need base URL config in real app)
        // For local dev: http://localhost:5000/uploads/filename
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        const ad = new Advertisement({
            title,
            description,
            target_url,
            image_url: imageUrl,
            user_id: (req as any).user.userId,
            is_active: true
        });

        await ad.save();
        res.json({ data: ad, error: null });
    } catch (error) {
        console.error('Create ad error:', error);
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Toggle Ad Status
router.patch('/:id/toggle', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ad = await Advertisement.findOne({ _id: id, user_id: (req as any).user.userId });
        if (!ad) return res.status(404).json({ error: { message: 'Ad not found' } });

        ad.is_active = !ad.is_active;
        await ad.save();
        res.json({ data: ad, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Delete Ad
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ad = await Advertisement.findOneAndDelete({ _id: id, user_id: (req as any).user.userId });
        if (!ad) return res.status(404).json({ error: { message: 'Ad not found' } });

        // Should also delete file from fs
        // fs.unlink... (omitted for brevity, but recommended)

        res.json({ data: { message: 'Deleted successfully' }, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

export default router;
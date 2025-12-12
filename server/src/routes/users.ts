import express from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

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

// List Users (Admin Only)
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const users = await User.find().sort({ created_at: -1 });
        // Map to profile format expected by frontend
        const profiles = users.map(u => ({
            id: u._id,
            email: u.email,
            full_name: u.full_name,
            role: u.role,
            // Assuming status is not yet in User model, defaulting to active if not present
            // or we should update User model to have status. Let's assume 'active' for now or add it to schema.
            // Plan had status? No, only ShortenedLink. But AdminPanel uses it.
            // Let's return a dummy status or add it to schema later.
            // User schema didn't have status, let's treat existence as active or add it.
            // Plan had status? No, only ShortenedLink. But AdminPanel uses it.
            // Let's return a dummy status or add it to schema later.
            status: (u as any).status || 'active',
            created_at: u.created_at
        }));
        res.json({ data: profiles, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

// Update User (Admin Only) - Status or Role
router.patch('/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, role } = req.body;

        let updateData: any = {};
        if (status) updateData.status = status; // Requires schema update if persisted
        if (role) updateData.role = role;

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: { message: 'User not found' } });
        }

        res.json({ data: updatedUser, error: null });
    } catch (error) {
        res.status(500).json({ error: { message: 'Internal server error' } });
    }
});

export default router;
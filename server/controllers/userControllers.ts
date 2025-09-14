import { Response } from 'express';
import { AuthRequest } from '../types/types';
import { pool } from '../utils/db';

// GET /user
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

        const userId = req.user.id;
        const q = 'SELECT id, email, username, role, created_at FROM users WHERE id = $1 LIMIT 1';
        const { rows } = await pool.query(q, [userId]);
        const user = rows[0];
        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.json(user);
    } catch (err) {
        console.error('Error fetching user.', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

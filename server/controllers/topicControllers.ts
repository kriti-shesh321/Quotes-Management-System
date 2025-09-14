import { Request, Response } from 'express';
import { pool } from '../utils/db';

export async function getTopics(_req: Request, res: Response) {
  try {
    const { rows } = await pool.query('SELECT id, name FROM topics ORDER BY name');
    return res.json(rows);
  } catch (err) {
    console.error('getTopics error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
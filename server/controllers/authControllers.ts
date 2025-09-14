import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../utils/db';
import { RegisterRequest, LoginRequest, User, UserData } from '../types/types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const SALT_ROUNDS = 10;

function toUserResponseObject(u: any): UserData {
    const { password_hash, ...rest } = u;
    return rest as UserData;
}

//POST auth/register
export async function register(req: Request, res: Response) {
    try {
        const body = req.body as RegisterRequest;

        if (!body || !body.email || !body.username || !body.password) {
            return res.status(400).json({ message: 'username, email and password required' });
        }

        const email = body.email ? body.email.trim().toLowerCase() : null;
        const username = body.username.trim();

        const checkUserQuery = 'SELECT id FROM users WHERE (email = $1 AND $1 IS NOT NULL) OR username = $2';
        const checkUserRes = await pool.query(checkUserQuery, [email, username]);
        if (checkUserRes.rows.length > 0) {
            return res.status(409).json({ message: 'Email or username already taken' });
        }

        const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);

        const insertQuery = `INSERT INTO users (email, username, password_hash)
                        VALUES ($1, $2, $3)
                        RETURNING id, email, username, role, created_at, password_hash`;
        const insertRes = await pool.query(insertQuery, [email, username, passwordHash]);
        const userObject = insertRes.rows[0] as User;

        const createdUserData = toUserResponseObject(userObject);

        return res.status(201).json({ user: createdUserData });
    } catch (err: any) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

//POST auth/login
export async function login(req: Request, res: Response) {
    try {
        const body = req.body as LoginRequest;

        if (!body || !body.password || !body.email) {
            return res.status(400).json({ message: 'provide email and password' });
        }

        const email = body.email.trim().toLowerCase();

        const query = 'SELECT id, email, username, password_hash, role, created_at FROM users WHERE username = $1 OR email = $1';
        const result = await pool.query(query, [email]);
        const userRow = result.rows[0] as User | undefined;

        if (!userRow) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(body.password, userRow.password_hash);
        if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials' });

        const userData = toUserResponseObject(userRow);
        const token = jwt.sign(
            { id: userData.id, email: userData.email, username: userData.username, role: userData.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({ token, user: userData });
    } catch (err: any) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}
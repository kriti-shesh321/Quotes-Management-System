import { Response, NextFunction } from 'express';
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { AuthPayload, AuthRequest } from "../types/types";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = (req.header('Authorization') || req.header('authorization') || '') as string;

    if (!authHeader) {
        return res.status(401).json({ message: 'No token, access denied.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    if (!token) return res.status(401).json({ message: "No token, access denied." });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export default authenticate;
// src/middleware/optionalAuth.ts
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthRequest, AuthPayload } from '../types/types';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = (req.header('Authorization') || req.header('authorization') || '') as string;
  if (!authHeader) return next();

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
  } catch (err) {
    console.warn('optionalAuth: invalid token, continuing as unauthenticated');
  }

  return next();
}

export default optionalAuth;
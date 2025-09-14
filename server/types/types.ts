import { Request } from 'express';

export type Role = 'user' | 'admin';

export interface User {
    id: number;
    email: string;
    username: string;
    password_hash: string;
    role: Role;
    created_at: string;
}

export interface Quote {
    id: number;
    topic_id: number | null;
    text: string;
    author?: string | null;
    is_public: boolean;
    is_favorite: boolean;
    user_id?: number | null;
    created_at: string;
    updated_at: string;
}

export interface UserData {
    id: number;
    email: string;
    username: string;
    role: Role;
    created_at: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface CreateQuote {
    text: string;
    is_public?: boolean;
    author?: string | null;
    topic_id?: number | null;
}
export interface UpdateQuote {
    text?: string;
    is_public?: boolean;
    author?: string;
    is_favorite?: boolean;
    topic_id?: number | null;
}

export interface AuthPayload {
    id: number;
    email?: string | null;
    username?: string;
    role?: Role;
}

export interface AuthRequest extends Request {
    user?: AuthPayload;
}

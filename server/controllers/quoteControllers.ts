import { Request, Response } from 'express';
import { pool } from '../utils/db';
import { AuthRequest } from "../types/types";

//GET /quotes?q=&topic_id=&is_favorite=&user_id=&only_my=&limit=&offset=
export async function getQuotes(req: Request, res: Response) {
    try {
        const q = (req.query.q as string || '').trim();
        const search = q ? `%${q}%` : '';
        const topicId = req.query.topic_id ? Number(req.query.topic_id) : null;
        const userFilter = req.query.user_id ? Number(req.query.user_id) : null;
        const onlyMy = req.query.only_my === 'true';
        const limit = Math.min(100, Number(req.query.limit || 20));
        const offset = Number(req.query.offset || 0);

        const authReq = req as AuthRequest;
        const isAuth = !!authReq.user;
        const isAdmin = isAuth && authReq.user!.role === 'admin';
        const meId = isAuth ? authReq.user!.id : null;

        // Build WHERE clauses and params array progressively
        const where: string[] = [];
        const params: any[] = [];

        // Search clause
        if (search) {
            params.push(search, search);
            where.push(`(q.text ILIKE $${params.length - 1} OR q.author ILIKE $${params.length})`);
        }

        // Topic filter
        if (topicId !== null) {
            params.push(topicId);
            where.push(`q.topic_id = $${params.length}`);
        }

        // User filter and visibility logic
        if (!isAuth) {
            // unauthenticated -> only public
            where.push(`q.is_public = TRUE`);
        } else if (isAdmin) {
            // admin -> no visibility restriction
            if (userFilter !== null) {
                params.push(userFilter);
                where.push(`q.user_id = $${params.length}`);
            }
        } else {
            // authenticated normal user
            if (onlyMy) {
                // only my quotes (public or private)
                params.push(meId);
                where.push(`q.user_id = $${params.length}`);
            } else if (userFilter !== null) {
                // viewing specific user's quotes: if it's me, allow my private; else only public
                if (userFilter === meId) {
                    params.push(userFilter);
                    where.push(`q.user_id = $${params.length}`);
                } else {
                    params.push(userFilter);
                    where.push(`q.user_id = $${params.length} AND q.is_public = TRUE`);
                }
            } else {
                // default: public OR my own
                params.push(meId);
                where.push(`(q.is_public = TRUE OR q.user_id = $${params.length})`);
            }
        }

        // Compose final SQL
        // Add username join and ordering/pagination
        params.push(limit, offset);
        const sql = `
      SELECT q.*, u.username
      FROM quotes q
      LEFT JOIN users u ON q.user_id = u.id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY q.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

        const { rows } = await pool.query(sql, params);
        return res.json(rows);
    } catch (err) {
        console.error('getQuotes error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// GET /quotes/:id
export async function getQuoteById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const { rows } = await pool.query(`SELECT q.*, u.username FROM quotes q LEFT JOIN users u ON q.user_id = u.id WHERE q.id = $1`, [id]);
        const quote = rows[0];
        if (!quote) return res.status(404).json({ message: 'Not found' });

        const authReq = req as AuthRequest;
        if (quote.is_public) return res.json(quote);

        if (!authReq.user) return res.status(403).json({ message: 'Forbidden' });
        const isOwner = authReq.user.id === quote.user_id;
        const isAdmin = authReq.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });
        return res.json(quote);
    } catch (err) {
        console.error('getQuoteById error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// POST /quotes
export const addQuote = async (req: AuthRequest, res: Response) => {
    try {
        const body = req.body;
        if (!body || !body.text) return res.status(400).json({ message: 'text required' });

        const userId = req.user?.id ?? null;
        const text = body.text.trim();
        const author = body.author ? body.author.trim() : null;
        const is_public = typeof body.is_public === 'boolean' ? body.is_public : true;
        const topic_id = typeof body.topic_id !== 'undefined' && body.topic_id !== null ? Number(body.topic_id) : null;

        const insertQuery = `INSERT INTO quotes (text, author, is_public, user_id, topic_id)
                     VALUES ($1,$2,$3,$4,$5) RETURNING *`;
        const { rows } = await pool.query(insertQuery, [text, author, is_public, userId, topic_id]);
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.error('createQuote error', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /quotes/:id
export async function updateQuote(req: AuthRequest, res: Response) {
    try {
        const id = Number(req.params.id);
        const body = req.body;
        if (!body || !body.text) return res.status(400).json({ message: 'text required' });

        // fetch the quote by id
        const { rows: qrows } = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
        const quote = qrows[0];
        if (!quote) return res.status(404).json({ message: 'Not found' });

        const isOwner = req.user && quote.user_id === req.user.id;
        const isAdmin = req.user && req.user.role === 'admin';
        console.log('User:', req.user);
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

        const newText = typeof body.text === 'string' ? body.text.trim() : quote.text;
        const newAuthor = typeof body.author === 'string' ? body.author.trim() : quote.author;
        const newIsFavorite = typeof body.is_favorite === 'boolean' ? body.is_favorite : quote.is_favorite;
        const newIsPublic = typeof body.is_public === 'boolean' ? body.is_public : quote.is_public;
        const newTopicId = typeof body.topic_id !== 'undefined' ? body.topic_id : quote.topic_id;

        const updateQuery = `UPDATE quotes SET text=$1, author=$2, is_favorite=$3, is_public=$4, topic_id=$5, updated_at = now() WHERE id=$6 RETURNING *`;
        const { rows: updatedRows } = await pool.query(updateQuery, [newText, newAuthor, newIsFavorite, newIsPublic, newTopicId, id]);
        return res.json(updatedRows[0]);
    } catch (err) {
        console.error('updateQuote error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// DELETE /quotes/:id
export async function deleteQuote(req: AuthRequest, res: Response) {
    try {
        const id = Number(req.params.id);
        const { rows: qrows } = await pool.query('SELECT * FROM quotes WHERE id = $1', [id]);
        const quote = qrows[0];
        if (!quote) return res.status(404).json({ message: 'Not found' });

        const isOwner = req.user && quote.user_id === req.user.id;
        const isAdmin = req.user && req.user.role === 'admin';
        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

        await pool.query('DELETE FROM quotes WHERE id = $1', [id]);
        return res.json({ message: 'deleted' });
    } catch (err) {
        console.error('deleteQuote error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

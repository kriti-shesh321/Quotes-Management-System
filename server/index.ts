import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes';
import quotesRoutes from './routes/quoteRoutes';
import userRoutes from './routes/userRoutes';
import dotenv from 'dotenv';

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 8000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

// health
app.get('/health', (_req, res) => res.json({ ok: true }));

// routes
app.use('/auth', authRoutes);
app.use('/quotes', quotesRoutes);
app.use('/user', userRoutes);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
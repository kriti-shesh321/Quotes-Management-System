import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api';
import type { User } from '../../types/types';

interface AuthState { token: string | null; user: User | null; status: 'idle' | 'loading' | 'failed'; }

const initialState: AuthState = {
    token: localStorage.getItem('token') || null,
    user: null,
    status: 'idle',
};

export const login = createAsyncThunk(
    'auth/login',
    async (payload: { email: string; password: string; }) => {
        const res = await api.post('/auth/login', payload);
        return res.data;
    }
);

export const register = createAsyncThunk('auth/register', async (payload: { username: string; email?: string; password: string; }) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
});

export const fetchMe = createAsyncThunk('/user', async () => {
    const res = await api.get('/user');
    return res.data as User;
});

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.token = null; state.user = null;
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        },
        setToken(state, action) {
            state.token = action.payload; localStorage.setItem('token', action.payload);
            api.defaults.headers.common['Authorization'] = `Bearer ${action.payload}`;
        }
    },
    extraReducers: builder => {
        builder.addCase(login.fulfilled, (state, action) => {
            state.token = action.payload.token; state.user = action.payload.user; state.status = 'idle';
            localStorage.setItem('token', action.payload.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
        });
        builder.addCase(register.fulfilled, (state, action) => {
            if (action.payload?.token) {
                state.token = action.payload.token;
                state.user = action.payload.user;
                localStorage.setItem('token', action.payload.token);
                api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            }
        });
        builder.addCase(fetchMe.fulfilled, (state, action) => { state.user = action.payload; });
        builder.addCase(login.rejected, state => { state.status = 'failed'; });
    }
});

export const { logout, setToken } = slice.actions;
export default slice.reducer;

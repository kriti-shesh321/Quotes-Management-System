import React, { useState } from 'react';
import { useAppDispatch } from '../hooks';
import { login, register } from '../store/slices/authSlice';

export default function Auth() {
    const dispatch = useAppDispatch();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            if (mode === 'login') {
                await dispatch(login({ email, password }));
            } else {
                await dispatch(register({ username, email, password }));
                await dispatch(login({ email, password }));
            }
        } catch (err: any) {
            console.log('Auth error', err);
            const message = err?.message || err?.data?.message || 'Signup/Login failed';
            setError(message);
            console.log('Auth error', err?.message);
        }

    }

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-xl font-bold mb-3">
                {mode === 'login' ? 'Login' : 'Register'}
            </h2>

            <form onSubmit={onSubmit} className="flex flex-col gap-2">
                {mode === 'register' && (
                    <input
                        className="p-2 border"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                )}
                <input
                    className="p-2 border"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    className="p-2 border"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />

                {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

                <button
                    className="bg-blue-600 text-white p-2 rounded mt-2"
                    type="submit"
                >
                    {mode === 'login' ? 'Login' : 'Register'}
                </button>
            </form>

            <button
                className="mt-2 text-sm"
                onClick={() => setMode(m => (m === 'login' ? 'register' : 'login'))}
            >
                {mode === 'login'
                    ? 'Create account'
                    : 'Already have an account? Login'}
            </button>
        </div>
    );
}

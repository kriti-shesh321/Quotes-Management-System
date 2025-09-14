import { useEffect } from 'react';
import Auth from './components/Auth';
import AddQuote from './components/AddQuote';
import QuotesList from './components/QuotesList';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchMe, logout } from './store/slices/authSlice';


export default function App() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);

  useEffect(() => {
    if (auth.token && !auth.user) dispatch(fetchMe());
  }, [auth.token]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      {!auth.user ? <Auth /> : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Quotes App</h1>
            <div>
              <div>{auth.user.username} ({auth.user.role})</div>
              <button
                className="px-2 py-1 border rounded text-sm"
                onClick={() => dispatch(logout())}
              >
                Logout
              </button>
            </div>
          </div>

          <AddQuote />
          <QuotesList />

        </>
      )}
    </div>
  );
}
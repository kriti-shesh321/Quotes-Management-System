import { useEffect } from 'react';
import Auth from './components/Auth';
import AddQuote from './components/AddQuote';
import QuotesList from './components/QuotesList';
import UserMenu from './components/UserMenu';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchMe } from './store/slices/authSlice';
import Spinner from './components/Spinner';

export default function App() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);

  useEffect(() => {
    if (auth.token && !auth.user) dispatch(fetchMe());
  }, [auth.token, auth.user, dispatch]);

  if (auth.token && !auth.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <div className="text-sm text-gray-600 mt-3">Checking session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!auth.user ? (
        <Auth />
      ) : (
        <>
          <header className="w-full fixed z-10 bg-white shadow-sm">
            <div className="max-w-5xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Quotes App</h1>
              </div>

              <UserMenu />
            </div>
          </header>

          <main className="max-w-5xl mx-auto px-5 md:px-8 pt-28 pb-10">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="sticky top-6">
                  <AddQuote />
                </div>
              </div>

              <div className="md:w-2/3">
                <QuotesList />
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}
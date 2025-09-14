import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import quotesReducer from './slices/quotesSlice';

export const store = configureStore({
  reducer: { auth: authReducer, quotes: quotesReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
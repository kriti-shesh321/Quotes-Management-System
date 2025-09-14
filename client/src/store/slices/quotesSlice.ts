import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../lib/api';
import type { Quote } from '../../types/types';

interface QuotesState { items: Quote[]; offset: number; finished: boolean; status: 'idle'|'loading'|'failed' }
const initialState: QuotesState = { items: [], offset: 0, finished: false, status: 'idle' };

export const fetchQuotes = createAsyncThunk('quotes/fetch', async (params:{ limit?:number, offset?:number, topic_id?:number, q?: string }) => {
  const res = await api.get('/quotes', { params });
  return res.data as Quote[];
});

export const createQuote = createAsyncThunk('quotes/create', async (payload:Partial<Quote>) => {
  const res = await api.post('/quotes', payload);
  return res.data as Quote;
});

export const updateQuote = createAsyncThunk('quotes/update', async ({id, body}:{id:number, body:any}) => {
  const res = await api.put(`/quotes/${id}`, body);
  return res.data as Quote;
});

export const deleteQuote = createAsyncThunk('quotes/delete', async (id:number) => {
  await api.delete(`/quotes/${id}`);
  return id;
});

const slice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    appendQuotes(state, action: PayloadAction<Quote[]>) {
      state.items.push(...action.payload);
      state.offset = state.items.length;
      if (action.payload.length === 0) state.finished = true;
    },
    resetQuotes(state) { state.items = []; state.offset = 0; state.finished = false; }
  },
  extraReducers: builder => {
    builder.addCase(fetchQuotes.fulfilled, (state, action) => {
      state.items = action.payload;
      state.offset = action.payload.length;
      state.finished = action.payload.length === 0;
      state.status = 'idle';
    });
    builder.addCase(createQuote.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });
    builder.addCase(updateQuote.fulfilled, (state, action) => {
      state.items = state.items.map(i => i.id === action.payload.id ? action.payload : i);
    });
    builder.addCase(deleteQuote.fulfilled, (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
    });
  }
});

export const { appendQuotes, resetQuotes } = slice.actions;
export default slice.reducer;

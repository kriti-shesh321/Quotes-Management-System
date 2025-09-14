import React, { useState } from 'react';
import { useAppDispatch } from '../hooks';
import { createQuote } from '../store/slices/quotesSlice';

export default function AddQuote(){
  const dispatch = useAppDispatch();
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if (!text.trim()) return;
    await dispatch(createQuote({ text: text.trim(), author: author || null, is_public: isPublic }));
    setText(''); setAuthor(''); setIsPublic(true);
  }

  return (
    <form onSubmit={submit} className="p-3 border rounded mb-4">
      <textarea className="w-full p-2 border" required value={text} onChange={e=>setText(e.target.value)} placeholder="Write a quote..." />
      <input className="w-full p-2 border mt-2" value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Author (optional)" />
      <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} /> Public</label>
      <button className="bg-green-600 text-white p-2 rounded mt-2" type="submit">Add Quote</button>
    </form>
  );
}
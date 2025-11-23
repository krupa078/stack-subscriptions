import React, { useState } from 'react';
import api from '../api';

export default function PostForm({ user, onPosted }){
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!file && !caption) return alert('Add a caption or media');
    setLoading(true);
    const fd = new FormData();
    fd.append('caption', caption);
    if (file) fd.append('media', file);
    try {
      await api.post('/posts/create', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setCaption(''); setFile(null);
      onPosted && onPosted();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post');
    } finally { setLoading(false); }
  };

  return (
    <form className="post-form" onSubmit={submit}>
      <textarea placeholder="Say something..." value={caption} onChange={e=>setCaption(e.target.value)} />
      <input type="file" onChange={e=>setFile(e.target.files[0])} />
      <button type="submit" disabled={loading}>Post</button>
    </form>
  );
}

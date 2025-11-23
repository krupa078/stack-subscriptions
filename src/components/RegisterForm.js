import React, { useState } from 'react';
import api from '../api';

export default function RegisterForm({ onRegistered }){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async e => {
    e.preventDefault();
    try{
      const res = await api.post('/auth/register', { username, password });
      onRegistered && onRegistered(res.data.token);
    }catch(err){
      alert(err.response?.data?.message || 'Register failed');
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <h3>Register</h3>
      <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} required />
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button type="submit">Register</button>
    </form>
  );
}

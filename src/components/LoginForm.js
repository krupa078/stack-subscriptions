import React, { useState } from 'react';
import api from '../api';

export default function LoginForm({ onLoggedIn }){
  const [username, setUsername] = useState('demo_user');
  const [password, setPassword] = useState('demo_pass');

  const submit = async e => {
    e.preventDefault();
    try{
      const res = await api.post('/auth/login', { username, password });
      onLoggedIn && onLoggedIn(res.data.token);
    }catch(err){
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <h3>Login</h3>
      <input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} required />
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button type="submit">Login</button>
    </form>
  );
}

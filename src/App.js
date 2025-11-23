import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from './api';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PostForm from './components/PostForm';
import PostCard from './components/PostCard';
import FriendsPanel from './components/FriendsPanel';

function App(){
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ps_token'));

  useEffect(()=>{
    if (token){
      setAuthToken(token);
      api.get('/auth/me').then(r=> setUser(r.data)).catch(()=> { setUser(null); setAuthToken(null); localStorage.removeItem('ps_token'); });
      fetchPosts();
    }
  }, [token]);

  function fetchPosts(){ 
    api.get('/posts/all').then(r=> setPosts(r.data)).catch(console.error);
  }

  function onLogin(t){
    setToken(t);
    localStorage.setItem('ps_token', t);
    setAuthToken(t);
    api.get('/auth/me').then(r=> setUser(r.data));
  }

  function logout(){
    setToken(null); setUser(null); localStorage.removeItem('ps_token'); setAuthToken(null);
  }

  return (
    <div className="container">
      <h1>Public Space</h1>
      {!user ? (
        <div className="auth-grid">
          <RegisterForm onRegistered={(t)=> onLogin(t)} />
          <LoginForm onLoggedIn={(t)=> onLogin(t)} />
        </div>
      ) : (
        <div className="topbar">
          <div>Welcome, <strong>{user.username}</strong> · Friends: {user.friends?.length || 0}</div>
          <div><button onClick={logout}>Logout</button></div>
        </div>
      )}
      {user && <FriendsPanel user={user} onUpdated={()=> api.get('/auth/me').then(r=> setUser(r.data))} />}
      {user && <PostForm user={user} onPosted={fetchPosts} />}
      <div className="feed">{posts.map(p=> <PostCard key={p._id} post={p} onRefresh={fetchPosts} userId={user?._id} />)}</div>
    </div>
  );
}

export default App;

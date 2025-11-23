import React, { useState } from 'react';
import api from '../api';

export default function FriendsPanel({ user, onUpdated }){
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const search = async ()=>{
    if (!query) return;
    const res = await api.get('/auth/search?q=' + encodeURIComponent(query));
    setResults(res.data);
  };

  const addFriend = async (friendId) => {
    await api.post(`/auth/${user._id}/add-friend`, { friendId });
    onUpdated && onUpdated();
  };

  return (
    <div className="friends-panel">
      <h3>Friends</h3>
      <div>Current: {user.friends?.length || 0}</div>
      <div className="friend-search">
        <input placeholder="Find users by name" value={query} onChange={e=>setQuery(e.target.value)} />
        <button onClick={search}>Search</button>
      </div>
      <div className="search-results">
        {results.map(r=> (
          <div key={r._id} className="result">
            <span>{r.username}</span>
            <button onClick={()=>addFriend(r._id)}>Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import api from "../api";

export default function SharePopup({ postId, onClose, onShare }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/auth/search?q=").then(res => setUsers(res.data));
  }, []);

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Share Post With:</h3>
        <button className="close-btn" onClick={onClose}>X</button>

        {users.map(u => (
          <div key={u._id} className="user-row">
            {u.username}
            <button
              onClick={() => onShare(u._id)}
              className="share-btn"
            >
              Share
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

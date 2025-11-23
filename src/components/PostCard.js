import React, { useState } from "react";
import api from "../api";
import SharePopup from "./SharePopup";
import toast from "react-hot-toast";

export default function PostCard({ post, onRefresh, userId }) {
  const [popup, setPopup] = useState(false);

  // ---------- LIKE ----------
  const like = async () => {
    try {
      await api.post(`/posts/${post._id}/like`);
      onRefresh();
    } catch (e) {
      toast.error("Failed to like");
    }
  };

  // ---------- COMMENT ----------
  const comment = async () => {
    const text = prompt("Comment text");
    if (!text) return;

    try {
      await api.post(`/posts/${post._id}/comment`, { text });
      toast.success("Comment added!");
      onRefresh();
    } catch (e) {
      toast.error("Failed to comment");
    }
  };

  // ---------- SHARE ----------
  const share = async (targetUserId) => {
    try {
      await api.post(`/posts/${post._id}/share`);
      toast.success("Post Shared Successfully!");
      setPopup(false);
      onRefresh();
    } catch (e) {
      toast.error("Failed to share");
    }
  };

  return (
    <div className="card">
      {/* Share popup */}
      {popup && (
        <SharePopup
          postId={post._id}
          onClose={() => setPopup(false)}
          onShare={share}
        />
      )}

      <div className="meta">
        <strong>{post.user?.username}</strong> ·{" "}
        <small>{new Date(post.createdAt).toLocaleString()}</small>
      </div>

      {/* MEDIA */}
      {post.mediaUrl &&
        (post.mediaType === "video" ? (
          <video
            src={`http://localhost:5000${post.mediaUrl}`}
            controls
            width="100%"
          />
        ) : (
          <img
            src={`http://localhost:5000${post.mediaUrl}`}
            alt=""
          />
        ))}

      {/* CAPTION */}
      <p>{post.caption}</p>

      {/* ACTION BUTTONS */}
      <div className="actions">
        <button onClick={like}>
          Like ({post.likes?.length || 0})
        </button>

        <button onClick={comment}>
          Comment ({post.comments?.length || 0})
        </button>

        <button onClick={() => setPopup(true)}>
          Share ({post.shares || 0})
        </button>
      </div>

      {/* COMMENTS */}
      <div className="comments">
        {post.comments?.map((c, idx) => (
          <div key={idx}>
            <small>{c.text}</small>
          </div>
        ))}
      </div>

      {/* SHARED BY */}
      {post.sharedBy?.length > 0 && (
        <div className="shared-by">
          <strong>Shared by:</strong>
          <ul>
            {post.sharedBy.map((u) => (
              <li key={u._id || u}>
                {u.username || u}
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

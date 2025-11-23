// frontend/src/components/MyQuestions.js
import React, { useEffect, useState } from "react";
import api from "../api";

export default function MyQuestions({ userId, onClose }) {
  const [questions, setQuestions] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/questions/${userId}`);
        setQuestions(res.data.questions);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [userId]);

  if (!questions) return <div>Loading questions...</div>;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={onClose} style={{ marginBottom: 12 }}>⬅ Back</button>
      <h2>My Questions</h2>
      {questions.length === 0 && <p>No questions found.</p>}
      {questions.map((q) => (
        <div key={q._id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 10, borderRadius: 6 }}>
          <div style={{ fontSize: 14, color: "#666" }}>{new Date(q.date).toLocaleString()}</div>
          <h3 style={{ margin: "6px 0" }}>{q.title}</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{q.body}</p>
          <div style={{ fontSize: 13, color: "#333" }}>
            <b>Plan at posting:</b> {q.planId} &nbsp;|&nbsp; <b>CountToday:</b> {q.countToday}
          </div>
        </div>
      ))}
    </div>
  );
}

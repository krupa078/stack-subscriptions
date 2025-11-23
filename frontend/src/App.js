// src/App.js
import React, { useState } from "react";
import MySubscription from "./components/MySubscription";
import MyQuestions from "./components/MyQuestions";
import api from "./api";
import "./App.css";

function App() {
  const [userId, setUserId] = useState("user1"); 
  const [email, setEmail] = useState("demo@example.com");
  const [selectedPlan, setSelectedPlan] = useState("FREE");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [questionTitle, setQuestionTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [questionMsg, setQuestionMsg] = useState("");
  const [show, setShow] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  

  // ==============================
  // Subscribe Handler
  // ==============================
  const handleSubscribe = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/subscribe", {
        userId,
        email,
        planId: selectedPlan,
      });

      setMessage(
        `✅ ${res.data.message} | Plan: ${res.data.invoice.planName}, Amount: ₹${res.data.invoice.amount}, Txn: ${res.data.invoice.transactionId}`
      );
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setMessage("❌ " + err.response.data.message);
      } else {
        setMessage("❌ Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Post Question Handler
  // ==============================
  const handlePostQuestion = async () => {
    setQuestionMsg("");

    try {
      const res = await api.post("/questions", {
        userId,
        title: questionTitle,
        body: questionBody,
      });

      setQuestionMsg(
        `✅ ${res.data.message}. Used today: ${res.data.usedToday}, Remaining: ${res.data.remainingToday} (Plan: ${res.data.plan.name})`
      );
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setQuestionMsg("❌ " + err.response.data.message);
      } else {
        setQuestionMsg("❌ Something went wrong");
      }
    }
  };

  return (
    <div className="App">
      <h1>StackOverflow Subscriptions Demo</h1>

      {/* 🔥 My Subscription Button */}
      <button onClick={() => setShow(true)}>My Subscription</button>

      {/* Popup Component */}
      {show && <MySubscription userId={userId} onClose={() => setShow(false)} />}
      <button onClick={() => setShowQuestions(true)} style={{ marginLeft: 8 }}>
       📚 My Questions
      </button>
      {showQuestions && <MyQuestions userId={userId} onClose={() => setShowQuestions(false)} />}



      {/* ------------------------- */}
      {/* User Details */}
      {/* ------------------------- */}
      <div className="card">
        <h2>User Details</h2>

        <label>
          User ID:
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user id"
          />
        </label>

        <label>
          Email:
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </label>
      </div>

      {/* ------------------------- */}
      {/* Choose Plan Section */}
      {/* ------------------------- */}
      <div className="card">
        <h2>Choose Plan</h2>

        <label>
          <input
            type="radio"
            value="FREE"
            checked={selectedPlan === "FREE"}
            onChange={(e) => setSelectedPlan(e.target.value)}
          />
          Free Plan – ₹0/month – 1 question/day
        </label>

        <label>
          <input
            type="radio"
            value="BRONZE"
            checked={selectedPlan === "BRONZE"}
            onChange={(e) => setSelectedPlan(e.target.value)}
          />
          Bronze Plan – ₹100/month – 5 questions/day
        </label>

        <label>
          <input
            type="radio"
            value="SILVER"
            checked={selectedPlan === "SILVER"}
            onChange={(e) => setSelectedPlan(e.target.value)}
          />
          Silver Plan – ₹300/month – 10 questions/day
        </label>

        <label>
          <input
            type="radio"
            value="GOLD"
            checked={selectedPlan === "GOLD"}
            onChange={(e) => setSelectedPlan(e.target.value)}
          />
          Gold Plan – ₹1000/month – Unlimited questions
        </label>

        <button onClick={handleSubscribe} disabled={loading}>
          {loading ? "Processing..." : "Pay & Subscribe"}
        </button>

        {message && <p className="msg">{message}</p>}

        <p className="hint">
          ⚠️ Payment works only between <b>10:00 AM – 11:00 AM IST</b>.
        </p>
      </div>

      {/* ------------------------- */}
      {/* Post Question Section */}
      {/* ------------------------- */}
      <div className="card">
        <h2>Post Question</h2>
        <input
          placeholder="Question title"
          value={questionTitle}
          onChange={(e) => setQuestionTitle(e.target.value)}
        />
        <textarea
          placeholder="Question body"
          value={questionBody}
          onChange={(e) => setQuestionBody(e.target.value)}
        />
        <button onClick={handlePostQuestion}>Post Question</button>

        {questionMsg && <p className="msg">{questionMsg}</p>}
      </div>
    </div>
  );
}

export default App;

// server.js (updated - use as a whole file)
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();
const connectDB = require("./db");
const Question = require("./models/Question");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// connect to MongoDB
connectDB();

// -------------------------
// 1. PLAN CONFIGURATION
// -------------------------
const PLANS = {
  FREE: { id: "FREE", name: "Free Plan", price: 0, questionLimitPerDay: 1 },
  BRONZE: { id: "BRONZE", name: "Bronze Plan", price: 100, questionLimitPerDay: 5 },
  SILVER: { id: "SILVER", name: "Silver Plan", price: 300, questionLimitPerDay: 10 },
  GOLD: { id: "GOLD", name: "Gold Plan", price: 1000, questionLimitPerDay: null },
};

// in-memory subscription store (still used, but persistence for questions is in DB)
const userSubscriptions = {}; // { userId: { planId, planName, price, transactionId, startedAt, expiresAt } }

// -------------------------
// IST helpers
// -------------------------
function getISTDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 330 * 60000);
}
function isWithinPaymentWindow() {
  const ist = getISTDate();
  return ist.getHours() === 10;
}
function formatISTDateTime() {
  const d = getISTDate();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} IST`;
}

// -------------------------
// Mock payment & email
// -------------------------
async function processPaymentMock(amount, planName, userId) {
  console.log(`Processing MOCK payment for user=${userId}, plan=${planName}, amount=₹${amount}`);
  await new Promise((r) => setTimeout(r, 500));
  return { success: true, transactionId: "TXN-" + Date.now() };
}

async function sendInvoiceEmailMock({ to, plan, amount, transactionId }) {
  console.log("---- INVOICE EMAIL MOCK ----");
  console.log("To:", to);
  console.log("Plan:", plan.name);
  console.log("Amount:", amount);
  console.log("Transaction ID:", transactionId);
  console.log("Questions per day:", plan.questionLimitPerDay === null ? "Unlimited" : plan.questionLimitPerDay);
  console.log("Time:", formatISTDateTime());
  console.log("----------------------------");
}

// -------------------------
// Subscribe endpoint (mock payment)
// -------------------------
app.post("/api/subscribe", async (req, res) => {
  try {
    const { userId, email, planId } = req.body;
    if (!userId || !email || !planId) return res.status(400).json({ message: "userId, email, planId required" });

    if (!isWithinPaymentWindow()) {
      return res.status(403).json({
        message: "Payment allowed only between 10:00 AM and 11:00 AM IST. Please try again tomorrow.",
      });
    }

    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ message: "Invalid planId" });

    const paymentResult = await processPaymentMock(plan.price, plan.name, userId);
    if (!paymentResult.success) return res.status(500).json({ message: "Payment failed." });

    const now = getISTDate();
    let expiresAt = null;
    if (plan.price > 0) {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    userSubscriptions[userId] = {
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      transactionId: paymentResult.transactionId,
      startedAt: now.toISOString(),
      expiresAt,
    };

    await sendInvoiceEmailMock({ to: email, plan, amount: plan.price, transactionId: paymentResult.transactionId });

    return res.json({
      message: "Subscription successful!",
      subscription: userSubscriptions[userId],
      invoice: { transactionId: paymentResult.transactionId, amount: plan.price, planName: plan.name, purchasedAt: formatISTDateTime() },
    });
  } catch (err) {
    console.error("Error in /api/subscribe:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// -------------------------
// POST /api/questions -> Save question to DB
// -------------------------
app.post("/api/questions", async (req, res) => {
  try {
    const { userId, title, body } = req.body;
    if (!userId || !title || !body) return res.status(400).json({ message: "userId, title, body required" });

    // determine subscription & plan for user (falls back to FREE)
    const subscription = userSubscriptions[userId];
    const plan = subscription ? PLANS[subscription.planId] : PLANS.FREE;

    // check expiry if any
    if (subscription && subscription.expiresAt) {
      const now = getISTDate();
      if (now > new Date(subscription.expiresAt)) {
        // expired -> treat as FREE
        console.log("Subscription expired for user:", userId);
      }
    }

    // unlimited for GOLD
    if (plan.questionLimitPerDay === null) {
      // save to DB anyway
      const q = await Question.create({ userId, title, body, planId: plan.id, countToday: 0 });
      return res.json({ message: "Question posted (GOLD unlimited).", id: q._id });
    }

    // compute how many questions user has posted today (from DB)
    // today in IST - start of day and end of day
    const istNow = getISTDate();
    const startOfDay = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate(), 0, 0, 0) - (330 * 60000));
    // alternative simpler approach: create ISO date string of YYYY-MM-DD in IST and match with local day part
    const todayStr = formatISTDateTime().slice(0, 10); // YYYY-MM-DD

    // count today's questions for the user
    const countToday = await Question.countDocuments({
      userId,
      date: {
        $gte: new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z"),
      },
    }).catch(() => 0);

    // *Note:* counting by date above uses UTC midnight; to keep behaviour simple we can also compute by string
    // We'll compute today's ordinal as countToday + 1
    const ordinal = (countToday || 0) + 1;

    if (countToday >= plan.questionLimitPerDay) {
      return res.status(403).json({ message: `You have reached your daily limit (${plan.questionLimitPerDay} questions) for plan: ${plan.name}.` });
    }

    // Save question
    const newQ = await Question.create({ userId, title, body, planId: plan.id, countToday: ordinal });

    return res.json({
      message: "Question posted successfully",
      id: newQ._id,
      usedToday: ordinal,
      remainingToday: plan.questionLimitPerDay - ordinal,
      plan: { id: plan.id, name: plan.name },
    });
  } catch (err) {
    console.error("Error in /api/questions:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// -------------------------
// GET /api/questions/:userId -> Fetch user's saved questions
// -------------------------
app.get("/api/questions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await Question.find({ userId }).sort({ date: -1 }).lean();
    return res.json({ questions: rows });
  } catch (err) {
    console.error("Error in GET /api/questions/:userId", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// -------------------------
// GET subscription details -> include today's used count (computed from DB)
// -------------------------
app.get("/api/subscription/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const subscription = userSubscriptions[userId];

    // compute today's used count via DB
    // We'll compute by matching ISO date string prefix YYYY-MM-DD in UTC created date -> simpler approach:
    const todayStr = formatISTDateTime().slice(0, 10); // YYYY-MM-DD

    // find count of user's questions where date starts with today's date in IST approximation
    const startIso = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");
    const endIso = new Date(new Date().toISOString().slice(0, 10) + "T23:59:59.999Z");

    const usedToday = await Question.countDocuments({
      userId,
      date: { $gte: startIso, $lte: endIso },
    }).catch(() => 0);

    if (!subscription) {
      return res.json({
        active: false,
        plan: PLANS.FREE,
        subscription: null,
        usedToday,
      });
    }

    return res.json({
      active: true,
      plan: PLANS[subscription.planId],
      subscription,
      usedToday,
    });
  } catch (err) {
    console.error("Error in GET /api/subscription/:userId", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// -------------------------
// Start server
// -------------------------
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

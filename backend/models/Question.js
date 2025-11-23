// backend/models/Question.js
const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  date: { type: Date, default: () => new Date() },
  planId: { type: String, required: true }, // plan at the time of posting (FREE/BRONZE/SILVER/GOLD)
  countToday: { type: Number, default: 1 }, // ordinal number of today's post for user
});

module.exports = mongoose.model("Question", QuestionSchema);

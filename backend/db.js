// backend/db.js
// MongoDB connection helper using mongoose
// Keeps it simple and avoids deprecated options.

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not defined in environment (.env).");
    process.exit(1);
  }

  try {
    // Connect without deprecated options. Mongoose will use sensible defaults.
    await mongoose.connect(uri);

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message || err);
    // Optional: exit so the process doesn't run in a broken state
    process.exit(1);
  }

  // Optional: connection event logging (useful while debugging)
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });
}

module.exports = connectDB;

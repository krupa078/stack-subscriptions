// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://subscriptions-api-backend.onrender.com/api",
});

export default api;


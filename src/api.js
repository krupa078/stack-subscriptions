import axios from 'axios';
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://public-space-project-ohzq.onrender.com/api'
});

export function setAuthToken(token){
  if (token) api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  else delete api.defaults.headers.common['Authorization'];
}

export default api;

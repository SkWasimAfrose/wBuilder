import axios from 'axios';

// Get the base URL from environment variables
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api';

const API = axios.create({
  baseURL: BASE_URL,
  // withCredentials: true, // Removed as we are migrating away from cookie-based auth
});

export default API;

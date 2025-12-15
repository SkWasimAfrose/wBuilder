import axios from 'axios';

// Get the base URL from environment variables
// Better Auth requires VITE_BASE_URL to end in "/api/auth"
// But general API calls already include "/api/" in their paths, so we need just the domain
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api/auth';

// Strip the "/api/auth" suffix to get just the domain for general API calls
// Example: "https://wbuilder-server.onrender.com/api/auth" -> "https://wbuilder-server.onrender.com"
const API_ROOT = BASE_URL.endsWith('/api/auth') 
  ? BASE_URL.slice(0, -9)  // Remove last 9 characters ("/api/auth")
  : BASE_URL.endsWith('/auth')
  ? BASE_URL.slice(0, -5)  // Remove last 5 characters ("/auth") 
  : BASE_URL;

const API = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
});

export default API;

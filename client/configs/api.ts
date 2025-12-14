import axios from 'axios'; // [1]

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // [1]
  withCredentials: true, // [1]
});

export default API; // [1]
import { createAuthClient } from "better-auth/react"; // [2]

export const authClient = createAuthClient({
  // Point to the backend server URL stored in environment variables
  baseURL: import.meta.env.VITE_BASE_URL, // [2]
  
  // Configuration for handling cookies across different ports/domains
  fetchOptions: {
    // auth: {
    //   type: "Bearer", 
    // },
    credentials: "include", // [3] Essential for Express/Node sessions to handle cookies correctly
  },
});

// Destructure and export key authentication methods for easy usage across components
export const { 
  signIn, 
  signUp, 
  useSession, 
  signOut 
} = authClient; // [3]


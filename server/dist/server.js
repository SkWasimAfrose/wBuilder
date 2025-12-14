import 'dotenv/config'; // [1]
import express from 'express'; // [1]
import cors from 'cors'; // [2]
import { auth } from './lib/auth.js'; // [3]
import { toNodeHandler } from 'better-auth/node'; // [3]
import userRouter from './routes/userRoutes.js'; // [4]
import projectRouter from './routes/projectRoutes.js'; // [5]
import { stripeWebhook } from './controllers/stripeWebhook.js'; // [6]
const app = express(); // [1]
const PORT = process.env.PORT || 3000; // [1]
// Configure CORS [7], [8]
const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS
        ? process.env.TRUSTED_ORIGINS.split(",")
        : [],
    credentials: true
};
app.use(cors(corsOptions)); // [7]
// Stripe Webhook Endpoint (Must be defined before express.json middleware to access raw body) [6]
app.post("/api/stripe", express.raw({ type: "application/json" }), stripeWebhook);
// Middleware to parse JSON with limit [4]
app.use(express.json({ limit: "50mb" }));
// Better Auth Handler [3]
app.all("/api/auth/*", toNodeHandler(auth));
// User API Routes [4]
app.use("/api/user", userRouter);
// Project API Routes [5]
app.use("/api/project", projectRouter);
// Basic Route to check server status [1]
app.get('/', (req, res) => {
    res.send("Server is live");
});
// Start the server [1]
app.listen(PORT, () => {
    console.log(`Server is running at localhost:${PORT}`);
});

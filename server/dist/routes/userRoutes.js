import express from 'express'; // [1]
import { createUserProject, getUserCredits, getUserProject, getUserProjects, purchaseCredits, togglePublish } from '../controllers/userController.js'; // [1], [2], [3]
import { protect } from '../middlewares/authMiddleware.js'; // [2]
const userRouter = express.Router(); // [1]
// Route to get user credits
userRouter.get('/credits', protect, getUserCredits); // [2]
// Route to create a new project
userRouter.post('/project', protect, createUserProject); // [2]
// Route to get a specific project by ID
userRouter.get('/project/:projectId', protect, getUserProject); // [3]
// Route to get all projects for the logged-in user
userRouter.get('/projects', protect, getUserProjects); // [3]
// Route to toggle the publish status of a project (Public/Private)
userRouter.get('/publish-toggle/:projectId', protect, togglePublish); // [3], [4]
// Route to purchase credits (Stripe Session)
userRouter.post('/purchase-credits', protect, purchaseCredits); // [5]
export default userRouter; // [5]

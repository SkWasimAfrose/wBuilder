import express from 'express'; // [1]
import { 
    deleteProject, 
    getProjectById, 
    getProjectPreview, 
    getPublishedProjects, 
    makeRevision, 
    rollBackToVersion, 
    saveProjectCode 
} from '../controllers/projectController.js'; // [1], [2], [3]
import { protect } from '../middlewares/authMiddleware.js'; // [1]

const projectRouter = express.Router(); // [1]

// Route to create a new revision (AI generation) for a project
projectRouter.post('/version/:projectId', protect, makeRevision); // [1]

// Route to save manual code edits
projectRouter.put('/save/:projectId', protect, saveProjectCode); // [2]

// Route to roll back to a specific version
projectRouter.get('/rollback/:projectId/:versionId', protect, rollBackToVersion); // [2]

// Route to delete a project
projectRouter.delete('/:projectId', protect, deleteProject); // [2]

// Route to get project code for preview (Requires Auth)
projectRouter.get('/preview/:projectId', protect, getProjectPreview); // [3]

// Route to get all published projects (Public - for Community page)
projectRouter.get('/published', getPublishedProjects); // [3], [4]

// Route to get a specific published project by ID (Public - for View page)
projectRouter.get('/published/:projectId', getProjectById); // [4]

export default projectRouter; // [4]

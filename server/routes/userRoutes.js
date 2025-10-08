import express from 'express';
import { checkForAuthentication } from '../middlewares/authMiddleware.js';
  
import { getUserProfile, ipfsUpload, listReviewers, getUserDashboardStats, upload } from '../controllers/userController.js';

const userRouter = express.Router();



userRouter.get('/profile', checkForAuthentication, getUserProfile);
userRouter.get('/dashboard-stats', checkForAuthentication, getUserDashboardStats);

userRouter.post("/upload",  checkForAuthentication, upload.single('file'), ipfsUpload);

//reviewers
userRouter.get("/reviewers", checkForAuthentication, listReviewers)

export default userRouter;


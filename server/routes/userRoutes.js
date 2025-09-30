import express from 'express';
import { checkForAuthentication } from '../middlewares/authMiddleware.js';
  
import { getUserProfile, ipfsUpload, listReviewers, upload } from '../controllers/userController.js';

const userRouter = express.Router();



userRouter.get('/profile', checkForAuthentication, getUserProfile);

userRouter.post("/upload",  checkForAuthentication, upload.single('file'), ipfsUpload);

//reviewers
userRouter.get("/reviewers", checkForAuthentication, listReviewers)

export default userRouter;


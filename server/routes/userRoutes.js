import express from 'express';
import { checkForAuthentication } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import { getUserProfile, ipfsUpload } from '../controllers/userController.js';

const userRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

userRouter.get('/profile', checkForAuthentication, getUserProfile);

userRouter.post("/upload",upload.single('file'),  checkForAuthentication, ipfsUpload);

export default userRouter;
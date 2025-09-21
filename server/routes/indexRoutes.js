import express from 'express';
import authRouter from './authRoutes.js';
import userRouter from './userRoutes.js';

const homeRouter = express.Router();

homeRouter.use('/auth', authRouter);
homeRouter.use('/user', userRouter);

export default homeRouter;
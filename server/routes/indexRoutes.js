import express from 'express';
import authRouter from './authRoutes.js';
import userRouter from './userRoutes.js';
import manuscriptRouter from './manuscriptRoutes.js';

const homeRouter = express.Router();

homeRouter.use('/auth', authRouter);
homeRouter.use('/user', userRouter);
homeRouter.use('/manuscript', manuscriptRouter);

export default homeRouter;
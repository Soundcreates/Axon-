const express = require('express');
const homeRouter = express.Router();
const authRouter = require('./authRoutes');
const userRouter = require('./userRoutes');

homeRouter.use('/auth', authRouter);
homeRouter.use('/user', userRouter);

module.exports = homeRouter;
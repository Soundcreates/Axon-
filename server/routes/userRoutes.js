const express = require('express');
const { checkForAuthentication } = require('../middlewares/authMiddleware');
const userRouter = express.Router();

const {getUserProfile} = require('../controllers/userController.js');

userRouter.get('/profile', checkForAuthentication, getUserProfile);

module.exports = userRouter;
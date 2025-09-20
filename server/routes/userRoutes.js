const express = require('express');
const { checkForAuthentication } = require('../middlewares/authMiddleware');
const userRouter = express.Router();
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

const {getUserProfile, ipfsUpload} = require('../controllers/userController.js');

userRouter.get('/profile', checkForAuthentication, getUserProfile);

userRouter.post("/upload",upload.single('file'),  checkForAuthentication, ipfsUpload);

module.exports = userRouter;
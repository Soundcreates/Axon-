import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Debug: Check if functions are properly imported
console.log('registerUser:', typeof registerUser);
console.log('loginUser:', typeof loginUser);

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
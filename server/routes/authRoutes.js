const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Debug: Check if functions are properly imported
console.log('registerUser:', typeof registerUser);
console.log('loginUser:', typeof loginUser);

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;
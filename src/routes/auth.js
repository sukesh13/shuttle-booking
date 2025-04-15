const express = require('express');
const {body, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {auth} = require('../middleware/auth');
const authController = require('../controllers/authController');
const router = express.Router();



router.post('/register', [
    body('username').isLength({min: 3}).withMessage('Username must be at least 3 characters long'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['student', 'admin']).withMessage('Invalid role')
], authController.registerUser);

router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').exists().withMessage('Password is required')
], authController.loginUser);

router.get('/profile', auth, authController.getProfile);

module.exports = router;
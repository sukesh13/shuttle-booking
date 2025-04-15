const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = {
     registerUser : async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, email, password, role } = req.body;

            // check if user already exists
            let user = await User.findOne({ username });
            let emailCheck = await User.findOne({ email });
            if (user || emailCheck) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Create new user
            user = new User({ username, email, password, role: role || 'student' });
            await user.save();

            // Generate token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    walletBalance: user.walletBalance
                }
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },

    loginUser : async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // check if user exists
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // validate password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user._id,
                    role: user.role
                }, process.env.JWT_SECRET, { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    walletBalance: user.walletBalance
                }
            });
        } catch (error) {
            console.error(error.message);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getProfile : async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);
        }
        catch(err) {
            console.error(err.message);
            res.status(500).json({message: 'Server error'});
        }
    }
};
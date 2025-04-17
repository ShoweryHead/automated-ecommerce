const express = require('express');
const router = express.Router();

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
  res.json({ message: 'Register user' });
});

// @route   POST api/users/login
// @desc    Login user & get token
// @access  Public
router.post('/login', (req, res) => {
  res.json({ message: 'Login user' });
});

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', (req, res) => {
  res.json({ message: 'Get current user profile' });
});

// @route   PUT api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', (req, res) => {
  res.json({ message: 'Update user profile' });
});

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', (req, res) => {
  res.json({ message: 'Get all users (admin only)' });
});

module.exports = router;

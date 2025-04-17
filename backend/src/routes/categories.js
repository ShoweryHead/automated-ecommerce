const express = require('express');
const router = express.Router();

// @route   GET api/categories
// @desc    Get all categories
// @access  Public
router.get('/', (req, res) => {
  res.json({ message: 'Get all categories' });
});

// @route   GET api/categories/:id
// @desc    Get single category
// @access  Public
router.get('/:id', (req, res) => {
  res.json({ message: `Get category with id ${req.params.id}` });
});

// @route   POST api/categories
// @desc    Create a category
// @access  Private
router.post('/', (req, res) => {
  res.json({ message: 'Create a category' });
});

// @route   PUT api/categories/:id
// @desc    Update a category
// @access  Private
router.put('/:id', (req, res) => {
  res.json({ message: `Update category with id ${req.params.id}` });
});

// @route   DELETE api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete category with id ${req.params.id}` });
});

module.exports = router;

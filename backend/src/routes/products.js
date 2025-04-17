const express = require('express');
const router = express.Router();

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', (req, res) => {
  res.json({ message: 'Get all products' });
});

// @route   GET api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', (req, res) => {
  res.json({ message: `Get product with id ${req.params.id}` });
});

// @route   POST api/products
// @desc    Create a product
// @access  Private
router.post('/', (req, res) => {
  res.json({ message: 'Create a product' });
});

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', (req, res) => {
  res.json({ message: `Update product with id ${req.params.id}` });
});

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete product with id ${req.params.id}` });
});

module.exports = router;

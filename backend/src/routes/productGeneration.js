const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const ProductGenerationService = require('../services/ProductGenerationService');
const ProductGenerationQueue = require('../models/ProductGenerationQueue');
const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * @route   POST /api/product-generation/queue
 * @desc    Queue a new product for generation
 * @access  Private/Admin
 */
router.post(
  '/queue',
  [
    check('keywords', 'At least one keyword is required').isArray({ min: 1 }),
    check('categoryId', 'Category ID is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { keywords, categoryId, priority, scheduledFor } = req.body;

      // Verify category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Queue the product generation
      const queueItem = await ProductGenerationService.queueProductGeneration(
        keywords,
        categoryId,
        { priority, scheduledFor }
      );

      res.json(queueItem);
    } catch (error) {
      console.error('Error in queue product generation:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   GET /api/product-generation/queue
 * @desc    Get all queued products
 * @access  Private/Admin
 */
router.get('/queue', async (req, res) => {
  try {
    const queueItems = await ProductGenerationQueue.find()
      .sort({ status: 1, priority: -1, queuedAt: 1 })
      .populate('category', 'name');

    res.json(queueItems);
  } catch (error) {
    console.error('Error getting queue items:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/product-generation/queue/:id
 * @desc    Get a specific queue item
 * @access  Private/Admin
 */
router.get('/queue/:id', async (req, res) => {
  try {
    const queueItem = await ProductGenerationQueue.findById(req.params.id)
      .populate('category', 'name')
      .populate('result.productId');

    if (!queueItem) {
      return res.status(404).json({ message: 'Queue item not found' });
    }

    res.json(queueItem);
  } catch (error) {
    console.error('Error getting queue item:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/product-generation/queue/:id
 * @desc    Delete a queue item
 * @access  Private/Admin
 */
router.delete('/queue/:id', async (req, res) => {
  try {
    const queueItem = await ProductGenerationQueue.findById(req.params.id);

    if (!queueItem) {
      return res.status(404).json({ message: 'Queue item not found' });
    }

    await queueItem.remove();

    res.json({ message: 'Queue item removed' });
  } catch (error) {
    console.error('Error deleting queue item:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/product-generation/process
 * @desc    Process the next queue item
 * @access  Private/Admin
 */
router.post('/process', async (req, res) => {
  try {
    const result = await ProductGenerationService.processNextQueueItem();
    res.json(result);
  } catch (error) {
    console.error('Error processing queue item:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/product-generation/schedule
 * @desc    Schedule products for publication
 * @access  Private/Admin
 */
router.post('/schedule', async (req, res) => {
  try {
    const result = await ProductGenerationService.scheduleProducts();
    res.json(result);
  } catch (error) {
    console.error('Error scheduling products:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/product-generation/publish
 * @desc    Publish scheduled products
 * @access  Private/Admin
 */
router.post('/publish', async (req, res) => {
  try {
    const result = await ProductGenerationService.publishScheduledProducts();
    res.json(result);
  } catch (error) {
    console.error('Error publishing products:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/product-generation/products
 * @desc    Get all generated products
 * @access  Private/Admin
 */
router.get('/products', async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { isAutomated: true };
    
    if (status) {
      query.status = status;
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .populate('category', 'name');

    res.json(products);
  } catch (error) {
    console.error('Error getting generated products:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/product-generation/products/:id
 * @desc    Update a generated product
 * @access  Private/Admin
 */
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      title,
      description,
      shortDescription,
      features,
      specifications,
      applications,
      faqs,
      metaTitle,
      metaDescription,
      status
    } = req.body;

    // Update fields if provided
    if (title) product.title = title;
    if (description) product.description = description;
    if (shortDescription) product.shortDescription = shortDescription;
    if (features) product.features = features;
    if (specifications) product.specifications = specifications;
    if (applications) product.applications = applications;
    if (faqs) product.faqs = faqs;
    if (metaTitle) product.metaTitle = metaTitle;
    if (metaDescription) product.metaDescription = metaDescription;
    if (status) {
      product.status = status;
      
      // If publishing, set publishedAt
      if (status === 'published' && product.status !== 'published') {
        product.publishedAt = new Date();
      }
    }

    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

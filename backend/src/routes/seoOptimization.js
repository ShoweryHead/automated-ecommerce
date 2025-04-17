const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const SEOOptimizationService = require('../services/SEOOptimizationService');
const SEOOptimizationQueue = require('../models/SEOOptimizationQueue');
const SEOSettings = require('../models/SEOSettings');
const Product = require('../models/Product');

/**
 * @route   POST /api/seo-optimization/queue
 * @desc    Queue a product for SEO optimization
 * @access  Private/Admin
 */
router.post(
  '/queue',
  [
    check('productId', 'Product ID is required').not().isEmpty(),
    check('optimizationType', 'Optimization type is required').isIn(['initial', 'refresh', 'performance_based']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { productId, optimizationType, priority, scheduledFor } = req.body;

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Queue the SEO optimization
      const queueItem = await SEOOptimizationService.queueSEOOptimization(
        productId,
        optimizationType,
        { priority, scheduledFor }
      );

      res.json(queueItem);
    } catch (error) {
      console.error('Error in queue SEO optimization:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   GET /api/seo-optimization/queue
 * @desc    Get all queued SEO optimizations
 * @access  Private/Admin
 */
router.get('/queue', async (req, res) => {
  try {
    const queueItems = await SEOOptimizationQueue.find()
      .sort({ status: 1, priority: -1, queuedAt: 1 })
      .populate('product', 'title');

    res.json(queueItems);
  } catch (error) {
    console.error('Error getting SEO optimization queue items:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/seo-optimization/queue/:id
 * @desc    Get a specific SEO optimization queue item
 * @access  Private/Admin
 */
router.get('/queue/:id', async (req, res) => {
  try {
    const queueItem = await SEOOptimizationQueue.findById(req.params.id)
      .populate('product', 'title');

    if (!queueItem) {
      return res.status(404).json({ message: 'Queue item not found' });
    }

    res.json(queueItem);
  } catch (error) {
    console.error('Error getting SEO optimization queue item:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/seo-optimization/queue/:id
 * @desc    Delete a SEO optimization queue item
 * @access  Private/Admin
 */
router.delete('/queue/:id', async (req, res) => {
  try {
    const queueItem = await SEOOptimizationQueue.findById(req.params.id);

    if (!queueItem) {
      return res.status(404).json({ message: 'Queue item not found' });
    }

    await queueItem.remove();

    res.json({ message: 'Queue item removed' });
  } catch (error) {
    console.error('Error deleting SEO optimization queue item:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/seo-optimization/process
 * @desc    Process the next SEO optimization queue item
 * @access  Private/Admin
 */
router.post('/process', async (req, res) => {
  try {
    const result = await SEOOptimizationService.processNextQueueItem();
    res.json(result);
  } catch (error) {
    console.error('Error processing SEO optimization queue item:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/seo-optimization/schedule
 * @desc    Schedule SEO optimizations
 * @access  Private/Admin
 */
router.post('/schedule', async (req, res) => {
  try {
    const result = await SEOOptimizationService.scheduleOptimizations();
    res.json(result);
  } catch (error) {
    console.error('Error scheduling SEO optimizations:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/seo-optimization/check-performance
 * @desc    Check and optimize products based on performance
 * @access  Private/Admin
 */
router.post('/check-performance', async (req, res) => {
  try {
    const result = await SEOOptimizationService.checkAndOptimizeByPerformance();
    res.json(result);
  } catch (error) {
    console.error('Error checking and optimizing by performance:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/seo-optimization/optimize/:id
 * @desc    Optimize a specific product
 * @access  Private/Admin
 */
router.post('/optimize/:id', async (req, res) => {
  try {
    const { optimizationType = 'refresh' } = req.body;
    
    // Verify product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Optimize the product
    const result = await SEOOptimizationService.optimizeProductSEO(req.params.id, optimizationType);
    
    res.json(result);
  } catch (error) {
    console.error('Error optimizing product:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/seo-optimization/settings
 * @desc    Get SEO settings
 * @access  Private/Admin
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await SEOSettings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error getting SEO settings:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/seo-optimization/settings
 * @desc    Update SEO settings
 * @access  Private/Admin
 */
router.put('/settings', async (req, res) => {
  try {
    const settings = await SEOSettings.getSettings();
    
    const {
      optimizationMode,
      scheduledOptimization,
      continuousOptimization,
      elements,
      internalLinking,
      performanceTracking
    } = req.body;
    
    // Update optimization mode
    if (optimizationMode) {
      settings.optimizationMode = optimizationMode;
    }
    
    // Update scheduled optimization settings
    if (scheduledOptimization) {
      if (scheduledOptimization.frequency) settings.scheduledOptimization.frequency = scheduledOptimization.frequency;
      if (scheduledOptimization.dayOfWeek !== undefined) settings.scheduledOptimization.dayOfWeek = scheduledOptimization.dayOfWeek;
      if (scheduledOptimization.dayOfMonth) settings.scheduledOptimization.dayOfMonth = scheduledOptimization.dayOfMonth;
      if (scheduledOptimization.timeOfDay) settings.scheduledOptimization.timeOfDay = scheduledOptimization.timeOfDay;
    }
    
    // Update continuous optimization settings
    if (continuousOptimization) {
      if (continuousOptimization.checkFrequency) settings.continuousOptimization.checkFrequency = continuousOptimization.checkFrequency;
      if (continuousOptimization.minPerformanceThreshold) settings.continuousOptimization.minPerformanceThreshold = continuousOptimization.minPerformanceThreshold;
      if (continuousOptimization.maxOptimizationsPerDay) settings.continuousOptimization.maxOptimizationsPerDay = continuousOptimization.maxOptimizationsPerDay;
    }
    
    // Update elements settings
    if (elements) {
      if (elements.metaTags !== undefined) settings.elements.metaTags = elements.metaTags;
      if (elements.headings !== undefined) settings.elements.headings = elements.headings;
      if (elements.content !== undefined) settings.elements.content = elements.content;
      if (elements.images !== undefined) settings.elements.images = elements.images;
      if (elements.internalLinks !== undefined) settings.elements.internalLinks = elements.internalLinks;
      if (elements.structuredData !== undefined) settings.elements.structuredData = elements.structuredData;
      if (elements.socialMedia !== undefined) settings.elements.socialMedia = elements.socialMedia;
    }
    
    // Update internal linking settings
    if (internalLinking) {
      if (internalLinking.enabled !== undefined) settings.internalLinking.enabled = internalLinking.enabled;
      if (internalLinking.maxLinksPerProduct) settings.internalLinking.maxLinksPerProduct = internalLinking.maxLinksPerProduct;
      if (internalLinking.minRelevanceScore) settings.internalLinking.minRelevanceScore = internalLinking.minRelevanceScore;
      if (internalLinking.requireApproval !== undefined) settings.internalLinking.requireApproval = internalLinking.requireApproval;
    }
    
    // Update performance tracking settings
    if (performanceTracking) {
      if (performanceTracking.enabled !== undefined) settings.performanceTracking.enabled = performanceTracking.enabled;
      if (performanceTracking.trackKeywordRankings !== undefined) settings.performanceTracking.trackKeywordRankings = performanceTracking.trackKeywordRankings;
      if (performanceTracking.trackPageSpeed !== undefined) settings.performanceTracking.trackPageSpeed = performanceTracking.trackPageSpeed;
    }
    
    await settings.save();
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/seo-optimization/analyze/:id
 * @desc    Analyze SEO performance of a product
 * @access  Private/Admin
 */
router.get('/analyze/:id', async (req, res) => {
  try {
    // Verify product exists
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Analyze SEO performance
    const analysis = await SEOOptimizationService.analyzeSEOPerformance(product);
    
    res.json({
      productId: product._id,
      productTitle: product.title,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing SEO performance:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

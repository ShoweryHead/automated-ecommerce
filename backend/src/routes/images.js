const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const ImageAutomationService = require('../services/ImageAutomationService');
const Image = require('../models/Image');
const ImageAutomationSettings = require('../models/ImageAutomationSettings');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

/**
 * @route   GET /api/images
 * @desc    Get all images with pagination and filtering
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build query based on filters
    const query = {};
    
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.sourceType) {
      query['source.type'] = req.query.sourceType;
    }
    
    if (req.query.entityType) {
      query['relatedTo.entityType'] = req.query.entityType;
    }
    
    if (req.query.entityId) {
      query['relatedTo.entityId'] = req.query.entityId;
    }
    
    // Get images
    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await Image.countDocuments(query);
    
    res.json({
      success: true,
      images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting images:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/images/:id
 * @desc    Get image by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    res.json({ success: true, image });
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/images/entity/:type/:id
 * @desc    Get images for an entity
 * @access  Private
 */
router.get('/entity/:type/:id', async (req, res) => {
  try {
    const result = await ImageAutomationService.getEntityImages(
      req.params.type,
      req.params.id
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error getting entity images:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/images/source
 * @desc    Source an image
 * @access  Private
 */
router.post('/source', [
  check('type', 'Image type is required').not().isEmpty(),
  check('entityType', 'Entity type is required').not().isEmpty(),
  check('entityName', 'Entity name is required').not().isEmpty()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    const result = await ImageAutomationService.sourceImage(req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error sourcing image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/images/product/:id
 * @desc    Source images for a product
 * @access  Private
 */
router.post('/product/:id', async (req, res) => {
  try {
    // Get product
    const product = await require('../models/Product').findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Source images
    const count = req.body.count || 1;
    const result = await ImageAutomationService.sourceProductImages(product, count);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error sourcing product images:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/images/blog/:id
 * @desc    Source images for a blog post
 * @access  Private
 */
router.post('/blog/:id', async (req, res) => {
  try {
    // Get blog post
    const blogPost = await require('../models/BlogPost').findById(req.params.id);
    
    if (!blogPost) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    // Source images
    const count = req.body.count || 1;
    const result = await ImageAutomationService.sourceBlogImages(blogPost, count);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error sourcing blog images:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/images/category/:id
 * @desc    Source a banner image for a category
 * @access  Private
 */
router.post('/category/:id', async (req, res) => {
  try {
    // Get category
    const category = await require('../models/Category').findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Source banner image
    const result = await ImageAutomationService.sourceCategoryBanner(category);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error sourcing category banner:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/images/social
 * @desc    Source a social media image
 * @access  Private
 */
router.post('/social', [
  check('title', 'Title is required').not().isEmpty()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  try {
    // Source social image
    const result = await ImageAutomationService.sourceSocialImage(req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error sourcing social image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/images/upload
 * @desc    Upload an image
 * @access  Private
 */
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    
    // Create image record
    const image = new Image({
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      path: `/uploads/images/${req.file.filename}`,
      url: `/uploads/images/${req.file.filename}`,
      type: req.body.type || 'other',
      metadata: {
        width: 0, // Will be updated with actual dimensions
        height: 0, // Will be updated with actual dimensions
        format: path.extname(req.file.filename).substring(1),
        size: req.file.size
      },
      source: {
        type: 'uploaded',
        provider: 'manual',
        license: req.body.license || 'unknown'
      },
      seo: {
        altText: req.body.altText || req.file.originalname,
        title: req.body.title || req.file.originalname,
        caption: req.body.caption || ''
      },
      status: 'active'
    });
    
    // If entity information is provided, link the image
    if (req.body.entityType && req.body.entityId) {
      image.relatedTo = {
        entityType: req.body.entityType,
        entityId: req.body.entityId
      };
    }
    
    await image.save();
    
    // Optimize the uploaded image if requested
    if (req.body.optimize === 'true') {
      await ImageAutomationService.optimizeExistingImage(image._id);
    }
    
    res.json({ success: true, image });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/images/:id
 * @desc    Update an image
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    // Update fields
    if (req.body.status) {
      image.status = req.body.status;
    }
    
    if (req.body.seo) {
      if (req.body.seo.altText) {
        image.seo.altText = req.body.seo.altText;
      }
      
      if (req.body.seo.title) {
        image.seo.title = req.body.seo.title;
      }
      
      if (req.body.seo.caption) {
        image.seo.caption = req.body.seo.caption;
      }
      
      if (req.body.seo.keywords) {
        image.seo.keywords = req.body.seo.keywords;
      }
    }
    
    if (req.body.relatedTo) {
      if (req.body.relatedTo.entityType) {
        image.relatedTo.entityType = req.body.relatedTo.entityType;
      }
      
      if (req.body.relatedTo.entityId) {
        image.relatedTo.entityId = req.body.relatedTo.entityId;
      }
    }
    
    await image.save();
    
    res.json({ success: true, image });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/images/:id/optimize
 * @desc    Optimize an existing image
 * @access  Private
 */
router.post('/:id/optimize', async (req, res) => {
  try {
    const result = await ImageAutomationService.optimizeExistingImage(req.params.id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error optimizing image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/images/:id/alt-text
 * @desc    Generate alt text for an image
 * @access  Private
 */
router.post('/:id/alt-text', async (req, res) => {
  try {
    const result = await ImageAutomationService.generateAltText(req.params.id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error generating alt text:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/images/batch
 * @desc    Batch process images
 * @access  Private
 */
router.post('/batch', async (req, res) => {
  try {
    const result = await ImageAutomationService.batchProcessImages(req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error batch processing images:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   DELETE /api/images/:id
 * @desc    Delete an image (mark as deleted)
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    
    // Mark as deleted instead of actually deleting
    image.status = 'deleted';
    await image.save();
    
    res.json({ success: true, message: 'Image marked as deleted' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/images/settings
 * @desc    Get image automation settings
 * @access  Private
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await ImageAutomationService.getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error getting image automation settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/images/settings
 * @desc    Update image automation settings
 * @access  Private
 */
router.put('/settings', async (req, res) => {
  try {
    // Get current settings
    let settings = await ImageAutomationSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      // Create new settings if none exist
      settings = new ImageAutomationSettings({});
    }
    
    // Update settings with request body
    Object.keys(req.body).forEach(key => {
      if (key === '_id' || key === 'createdAt' || key === 'updatedAt') {
        return;
      }
      
      if (typeof req.body[key] === 'object' && req.body[key] !== null) {
        // Handle nested objects
        Object.keys(req.body[key]).forEach(nestedKey => {
          if (settings[key]) {
            settings[key][nestedKey] = req.body[key][nestedKey];
          }
        });
      } else {
        settings[key] = req.body[key];
      }
    });
    
    // Save updated settings
    await settings.save();
    
    // Clear cache
    ImageAutomationService.settingsCache = null;
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error updating image automation settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

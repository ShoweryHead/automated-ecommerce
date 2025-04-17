const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const AutomationSettings = require('../models/AutomationSettings');

/**
 * @route   GET /api/automation-settings
 * @desc    Get automation settings
 * @access  Private/Admin
 */
router.get('/', async (req, res) => {
  try {
    const settings = await AutomationSettings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error getting automation settings:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/automation-settings
 * @desc    Update automation settings
 * @access  Private/Admin
 */
router.put('/', async (req, res) => {
  try {
    const settings = await AutomationSettings.getSettings();
    
    const {
      productListing,
      seo,
      contentGeneration,
      imageGeneration
    } = req.body;
    
    // Update product listing settings
    if (productListing) {
      if (productListing.enabled !== undefined) settings.productListing.enabled = productListing.enabled;
      if (productListing.publishFrequency) settings.productListing.publishFrequency = productListing.publishFrequency;
      if (productListing.customDaysInterval) settings.productListing.customDaysInterval = productListing.customDaysInterval;
      if (productListing.publishTime) settings.productListing.publishTime = productListing.publishTime;
      if (productListing.maxProductsPerMonth) settings.productListing.maxProductsPerMonth = productListing.maxProductsPerMonth;
      if (productListing.requireApproval !== undefined) settings.productListing.requireApproval = productListing.requireApproval;
    }
    
    // Update SEO settings
    if (seo) {
      if (seo.enabled !== undefined) settings.seo.enabled = seo.enabled;
      if (seo.optimizeExistingProducts !== undefined) settings.seo.optimizeExistingProducts = seo.optimizeExistingProducts;
      if (seo.keywordsPerProduct) settings.seo.keywordsPerProduct = seo.keywordsPerProduct;
      if (seo.updateFrequency) settings.seo.updateFrequency = seo.updateFrequency;
    }
    
    // Update content generation settings
    if (contentGeneration) {
      if (contentGeneration.model) settings.contentGeneration.model = contentGeneration.model;
      if (contentGeneration.temperature) settings.contentGeneration.temperature = contentGeneration.temperature;
      if (contentGeneration.maxTokens) settings.contentGeneration.maxTokens = contentGeneration.maxTokens;
      if (contentGeneration.generateFAQs !== undefined) settings.contentGeneration.generateFAQs = contentGeneration.generateFAQs;
      if (contentGeneration.faqCount) settings.contentGeneration.faqCount = contentGeneration.faqCount;
    }
    
    // Update image generation settings
    if (imageGeneration) {
      if (imageGeneration.enabled !== undefined) settings.imageGeneration.enabled = imageGeneration.enabled;
      if (imageGeneration.imagesPerProduct) settings.imageGeneration.imagesPerProduct = imageGeneration.imagesPerProduct;
      if (imageGeneration.preferredStyle) settings.imageGeneration.preferredStyle = imageGeneration.preferredStyle;
    }
    
    await settings.save();
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating automation settings:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/automation-settings/status
 * @desc    Get automation system status
 * @access  Private/Admin
 */
router.get('/status', async (req, res) => {
  try {
    const settings = await AutomationSettings.getSettings();
    
    // Return just the system status
    res.json({
      status: settings.system.status,
      lastRun: settings.system.lastRun,
      nextScheduledRun: settings.system.nextScheduledRun
    });
  } catch (error) {
    console.error('Error getting automation status:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/automation-settings/reset
 * @desc    Reset automation settings to defaults
 * @access  Private/Admin
 */
router.post('/reset', async (req, res) => {
  try {
    // Delete existing settings
    await AutomationSettings.deleteMany({});
    
    // Create new settings with defaults
    const settings = await AutomationSettings.getSettings();
    
    res.json({
      message: 'Automation settings reset to defaults',
      settings
    });
  } catch (error) {
    console.error('Error resetting automation settings:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

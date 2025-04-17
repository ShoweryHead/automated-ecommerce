const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const InventorySettings = require('../models/InventorySettings');
const Product = require('../models/Product');
const { check, validationResult } = require('express-validator');

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('product', 'name slug images');
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get inventory settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await InventorySettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new InventorySettings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update inventory settings
router.put('/settings', async (req, res) => {
  try {
    let settings = await InventorySettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new InventorySettings();
    }
    
    // Update fields from request body
    const updateFields = [
      'enabled', 'defaultLowStockThreshold', 'defaultLimitedStockThreshold',
      'defaultAutomation', 'alerts', 'display', 'supplierIntegration', 'reporting'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    
    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get inventory for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ product: req.params.productId }).populate('product', 'name slug images');
    
    if (!inventory) {
      return res.status(404).json({ msg: 'Inventory not found for this product' });
    }
    
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Inventory not found for this product' });
    }
    res.status(500).send('Server Error');
  }
});

// Create or update inventory for a product
router.post('/product/:productId', [
  check('stockLevel', 'Stock level is required').isNumeric(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Check if product exists
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Get inventory settings for defaults
    let settings = await InventorySettings.findOne();
    if (!settings) {
      settings = new InventorySettings();
      await settings.save();
    }
    
    // Find existing inventory or create new
    let inventory = await Inventory.findOne({ product: req.params.productId });
    
    if (!inventory) {
      // Create new inventory
      inventory = new Inventory({
        product: req.params.productId,
        stockLevel: req.body.stockLevel,
        lowStockThreshold: req.body.lowStockThreshold || settings.defaultLowStockThreshold,
        automation: {
          autoUpdateStatus: req.body.autoUpdateStatus !== undefined ? req.body.autoUpdateStatus : settings.defaultAutomation.autoUpdateStatus,
          autoHideWhenOutOfStock: req.body.autoHideWhenOutOfStock !== undefined ? req.body.autoHideWhenOutOfStock : settings.defaultAutomation.autoHideWhenOutOfStock,
          displayLimitedStockTag: req.body.displayLimitedStockTag !== undefined ? req.body.displayLimitedStockTag : settings.defaultAutomation.displayLimitedStockTag,
          limitedStockThreshold: req.body.limitedStockThreshold || settings.defaultLimitedStockThreshold
        },
        lastUpdated: {
          date: new Date(),
          by: req.body.updatedBy || 'system'
        }
      });
      
      // Add initial history entry
      inventory.history.push({
        date: new Date(),
        action: 'add',
        quantity: req.body.stockLevel,
        previousLevel: 0,
        newLevel: req.body.stockLevel,
        notes: 'Initial inventory setup',
        performedBy: req.body.updatedBy || 'system'
      });
    } else {
      // Update existing inventory
      const previousLevel = inventory.stockLevel;
      inventory.stockLevel = req.body.stockLevel;
      
      // Update other fields if provided
      if (req.body.lowStockThreshold) inventory.lowStockThreshold = req.body.lowStockThreshold;
      if (req.body.status) inventory.status = req.body.status;
      if (req.body.isAvailable !== undefined) inventory.isAvailable = req.body.isAvailable;
      if (req.body.restockDate) inventory.restockDate = req.body.restockDate;
      if (req.body.supplier) inventory.supplier = req.body.supplier;
      if (req.body.location) inventory.location = req.body.location;
      if (req.body.metadata) inventory.metadata = req.body.metadata;
      if (req.body.notes) inventory.notes = req.body.notes;
      
      // Update automation settings if provided
      if (req.body.automation) {
        Object.keys(req.body.automation).forEach(key => {
          inventory.automation[key] = req.body.automation[key];
        });
      }
      
      // Update alerts settings if provided
      if (req.body.alerts) {
        Object.keys(req.body.alerts).forEach(key => {
          inventory.alerts[key] = req.body.alerts[key];
        });
      }
      
      // Add history entry for the update
      inventory.history.push({
        date: new Date(),
        action: 'adjust',
        quantity: req.body.stockLevel - previousLevel,
        previousLevel,
        newLevel: req.body.stockLevel,
        notes: req.body.notes || 'Stock level updated',
        performedBy: req.body.updatedBy || 'system'
      });
      
      // Update last updated info
      inventory.lastUpdated = {
        date: new Date(),
        by: req.body.updatedBy || 'system'
      };
    }
    
    await inventory.save();
    
    // Check if we need to update product visibility based on stock
    if (inventory.automation.autoHideWhenOutOfStock && inventory.stockLevel <= 0) {
      product.isVisible = false;
      await product.save();
    } else if (inventory.automation.autoHideWhenOutOfStock && inventory.stockLevel > 0 && !product.isVisible) {
      product.isVisible = true;
      await product.save();
    }
    
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add stock to a product
router.post('/product/:productId/add', [
  check('quantity', 'Quantity is required').isNumeric(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    let inventory = await Inventory.findOne({ product: req.params.productId });
    
    if (!inventory) {
      return res.status(404).json({ msg: 'Inventory not found for this product' });
    }
    
    await inventory.addStock(
      req.body.quantity,
      req.body.notes || 'Stock added',
      req.body.performedBy || 'system'
    );
    
    // Check if we need to update product visibility
    if (inventory.automation.autoHideWhenOutOfStock && inventory.stockLevel > 0) {
      const product = await Product.findById(req.params.productId);
      if (product && !product.isVisible) {
        product.isVisible = true;
        await product.save();
      }
    }
    
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Remove stock from a product
router.post('/product/:productId/remove', [
  check('quantity', 'Quantity is required').isNumeric(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    let inventory = await Inventory.findOne({ product: req.params.productId });
    
    if (!inventory) {
      return res.status(404).json({ msg: 'Inventory not found for this product' });
    }
    
    await inventory.removeStock(
      req.body.quantity,
      req.body.notes || 'Stock removed',
      req.body.performedBy || 'system'
    );
    
    // Check if we need to update product visibility
    if (inventory.automation.autoHideWhenOutOfStock && inventory.stockLevel <= 0) {
      const product = await Product.findById(req.params.productId);
      if (product && product.isVisible) {
        product.isVisible = false;
        await product.save();
      }
    }
    
    res.json(inventory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get low stock items
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockItems = await Inventory.findLowStock();
    res.json(lowStockItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get out of stock items
router.get('/out-of-stock', async (req, res) => {
  try {
    const outOfStockItems = await Inventory.findOutOfStock();
    res.json(outOfStockItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get inventory history for a product
router.get('/product/:productId/history', async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ product: req.params.productId });
    
    if (!inventory) {
      return res.status(404).json({ msg: 'Inventory not found for this product' });
    }
    
    res.json(inventory.history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete inventory for a product
router.delete('/product/:productId', async (req, res) => {
  try {
    const inventory = await Inventory.findOne({ product: req.params.productId });
    
    if (!inventory) {
      return res.status(404).json({ msg: 'Inventory not found for this product' });
    }
    
    await inventory.remove();
    res.json({ msg: 'Inventory removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

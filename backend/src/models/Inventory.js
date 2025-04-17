const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  // Product reference
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Stock information
  stockLevel: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Stock status
  status: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued', 'pre_order'],
    default: 'in_stock'
  },
  
  // Threshold for low stock alerts
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 1
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Expected restock date (if out of stock)
  restockDate: {
    type: Date
  },
  
  // Supplier information
  supplier: {
    name: {
      type: String,
      trim: true
    },
    contactInfo: {
      type: String,
      trim: true
    },
    leadTime: {
      type: Number, // in days
      min: 0
    },
    minimumOrderQuantity: {
      type: Number,
      min: 1,
      default: 1
    }
  },
  
  // Stock location
  location: {
    warehouse: {
      type: String,
      trim: true
    },
    section: {
      type: String,
      trim: true
    },
    shelf: {
      type: String,
      trim: true
    }
  },
  
  // Stock history
  history: [{
    date: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['add', 'remove', 'adjust', 'restock', 'audit'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousLevel: {
      type: Number
    },
    newLevel: {
      type: Number
    },
    notes: {
      type: String,
      trim: true
    },
    performedBy: {
      type: String,
      trim: true
    }
  }],
  
  // Alert settings
  alerts: {
    lowStockEnabled: {
      type: Boolean,
      default: true
    },
    outOfStockEnabled: {
      type: Boolean,
      default: true
    },
    restockEnabled: {
      type: Boolean,
      default: true
    },
    recipients: [{
      type: String,
      trim: true
    }]
  },
  
  // Additional metadata
  metadata: {
    sku: {
      type: String,
      trim: true
    },
    barcode: {
      type: String,
      trim: true
    },
    weight: {
      type: Number,
      min: 0
    },
    dimensions: {
      length: {
        type: Number,
        min: 0
      },
      width: {
        type: Number,
        min: 0
      },
      height: {
        type: Number,
        min: 0
      },
      unit: {
        type: String,
        default: 'cm',
        enum: ['cm', 'in', 'm']
      }
    }
  },
  
  // Automation settings
  automation: {
    autoUpdateStatus: {
      type: Boolean,
      default: true
    },
    autoHideWhenOutOfStock: {
      type: Boolean,
      default: false
    },
    displayLimitedStockTag: {
      type: Boolean,
      default: true
    },
    limitedStockThreshold: {
      type: Number,
      default: 10
    }
  },
  
  // Last updated information
  lastUpdated: {
    date: {
      type: Date,
      default: Date.now
    },
    by: {
      type: String,
      trim: true
    }
  },
  
  // Notes
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to update status based on stock level
InventorySchema.pre('save', function(next) {
  if (this.automation.autoUpdateStatus) {
    if (this.stockLevel <= 0) {
      this.status = 'out_of_stock';
      this.isAvailable = false;
    } else if (this.stockLevel <= this.lowStockThreshold) {
      this.status = 'low_stock';
      this.isAvailable = true;
    } else {
      this.status = 'in_stock';
      this.isAvailable = true;
    }
  }
  
  this.lastUpdated.date = new Date();
  
  next();
});

// Method to add stock
InventorySchema.methods.addStock = async function(quantity, notes = '', performedBy = 'system') {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  
  const previousLevel = this.stockLevel;
  this.stockLevel += quantity;
  
  this.history.push({
    date: new Date(),
    action: 'add',
    quantity,
    previousLevel,
    newLevel: this.stockLevel,
    notes,
    performedBy
  });
  
  this.lastUpdated.date = new Date();
  this.lastUpdated.by = performedBy;
  
  return this.save();
};

// Method to remove stock
InventorySchema.methods.removeStock = async function(quantity, notes = '', performedBy = 'system') {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }
  
  if (quantity > this.stockLevel) {
    throw new Error('Cannot remove more than available stock');
  }
  
  const previousLevel = this.stockLevel;
  this.stockLevel -= quantity;
  
  this.history.push({
    date: new Date(),
    action: 'remove',
    quantity: -quantity,
    previousLevel,
    newLevel: this.stockLevel,
    notes,
    performedBy
  });
  
  this.lastUpdated.date = new Date();
  this.lastUpdated.by = performedBy;
  
  return this.save();
};

// Method to adjust stock to a specific level
InventorySchema.methods.adjustStock = async function(newLevel, notes = '', performedBy = 'system') {
  if (newLevel < 0) {
    throw new Error('New stock level cannot be negative');
  }
  
  const previousLevel = this.stockLevel;
  const quantity = newLevel - previousLevel;
  
  this.stockLevel = newLevel;
  
  this.history.push({
    date: new Date(),
    action: 'adjust',
    quantity,
    previousLevel,
    newLevel: this.stockLevel,
    notes,
    performedBy
  });
  
  this.lastUpdated.date = new Date();
  this.lastUpdated.by = performedBy;
  
  return this.save();
};

// Static method to find products with low stock
InventorySchema.statics.findLowStock = function() {
  return this.find({
    $or: [
      { status: 'low_stock' },
      { $expr: { $lte: ['$stockLevel', '$lowStockThreshold'] } }
    ]
  }).populate('product');
};

// Static method to find out of stock products
InventorySchema.statics.findOutOfStock = function() {
  return this.find({
    $or: [
      { status: 'out_of_stock' },
      { stockLevel: 0 }
    ]
  }).populate('product');
};

module.exports = mongoose.model('Inventory', InventorySchema);

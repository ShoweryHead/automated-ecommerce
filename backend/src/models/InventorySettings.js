const mongoose = require('mongoose');

const InventorySettingsSchema = new mongoose.Schema({
  // Global settings
  enabled: {
    type: Boolean,
    default: true
  },
  
  // Default thresholds
  defaultLowStockThreshold: {
    type: Number,
    default: 5,
    min: 1
  },
  
  defaultLimitedStockThreshold: {
    type: Number,
    default: 10,
    min: 1
  },
  
  // Default automation settings
  defaultAutomation: {
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
    }
  },
  
  // Alert settings
  alerts: {
    enabled: {
      type: Boolean,
      default: true
    },
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
    defaultRecipients: [{
      type: String,
      trim: true
    }],
    emailTemplates: {
      lowStock: {
        subject: {
          type: String,
          default: 'Low Stock Alert: {product_name}'
        },
        body: {
          type: String,
          default: 'The stock level for {product_name} is now {stock_level}, which is below the low stock threshold of {threshold}.'
        }
      },
      outOfStock: {
        subject: {
          type: String,
          default: 'Out of Stock Alert: {product_name}'
        },
        body: {
          type: String,
          default: 'The product {product_name} is now out of stock. Please consider restocking soon.'
        }
      },
      restock: {
        subject: {
          type: String,
          default: 'Restock Reminder: {product_name}'
        },
        body: {
          type: String,
          default: 'This is a reminder to restock {product_name}, which has been out of stock since {date}.'
        }
      }
    },
    sendDailyDigest: {
      type: Boolean,
      default: true
    },
    digestTime: {
      type: String,
      default: '09:00'
    }
  },
  
  // Display settings
  display: {
    showStockLevelOnProductPage: {
      type: Boolean,
      default: false
    },
    showStockStatusOnProductPage: {
      type: Boolean,
      default: true
    },
    limitedStockText: {
      type: String,
      default: 'Limited Stock Available'
    },
    outOfStockText: {
      type: String,
      default: 'Out of Stock'
    },
    inStockText: {
      type: String,
      default: 'In Stock'
    },
    limitedStockTagColor: {
      type: String,
      default: '#FFA500' // Orange
    },
    outOfStockTagColor: {
      type: String,
      default: '#FF0000' // Red
    },
    inStockTagColor: {
      type: String,
      default: '#008000' // Green
    }
  },
  
  // Supplier integration settings
  supplierIntegration: {
    enabled: {
      type: Boolean,
      default: false
    },
    autoReorder: {
      type: Boolean,
      default: false
    },
    reorderThreshold: {
      type: Number,
      default: 3
    },
    suppliers: [{
      name: {
        type: String,
        trim: true
      },
      email: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      apiEndpoint: {
        type: String,
        trim: true
      },
      apiKey: {
        type: String,
        trim: true,
        select: false
      }
    }]
  },
  
  // Reporting settings
  reporting: {
    generateWeeklyReport: {
      type: Boolean,
      default: true
    },
    generateMonthlyReport: {
      type: Boolean,
      default: true
    },
    reportRecipients: [{
      type: String,
      trim: true
    }],
    includeStockHistory: {
      type: Boolean,
      default: true
    },
    includeLowStockItems: {
      type: Boolean,
      default: true
    },
    includeOutOfStockItems: {
      type: Boolean,
      default: true
    },
    includeStockForecast: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventorySettings', InventorySettingsSchema);

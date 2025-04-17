const mongoose = require('mongoose');

const AutomationSettingsSchema = new mongoose.Schema({
  // Product listing automation settings
  productListing: {
    enabled: {
      type: Boolean,
      default: true
    },
    publishFrequency: {
      type: String,
      enum: ['daily', 'every_other_day', 'weekly', 'custom'],
      default: 'weekly'
    },
    customDaysInterval: {
      type: Number,
      default: 3
    },
    publishTime: {
      type: String,
      default: '09:00' // 24-hour format
    },
    maxProductsPerMonth: {
      type: Number,
      default: 10
    },
    requireApproval: {
      type: Boolean,
      default: true
    }
  },
  
  // SEO automation settings
  seo: {
    enabled: {
      type: Boolean,
      default: true
    },
    optimizeExistingProducts: {
      type: Boolean,
      default: true
    },
    keywordsPerProduct: {
      type: Number,
      default: 5
    },
    updateFrequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly'],
      default: 'monthly'
    }
  },
  
  // Content generation settings
  contentGeneration: {
    model: {
      type: String,
      default: 'gpt-4'
    },
    temperature: {
      type: Number,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      default: 2000
    },
    generateFAQs: {
      type: Boolean,
      default: true
    },
    faqCount: {
      type: Number,
      default: 5
    }
  },
  
  // Image generation settings
  imageGeneration: {
    enabled: {
      type: Boolean,
      default: true
    },
    imagesPerProduct: {
      type: Number,
      default: 3
    },
    preferredStyle: {
      type: String,
      default: 'realistic'
    }
  },
  
  // System settings
  system: {
    lastRun: {
      type: Date
    },
    nextScheduledRun: {
      type: Date
    },
    status: {
      type: String,
      enum: ['idle', 'running', 'error'],
      default: 'idle'
    }
  }
}, {
  timestamps: true
});

// Ensure there's only one settings document
AutomationSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('AutomationSettings', AutomationSettingsSchema);

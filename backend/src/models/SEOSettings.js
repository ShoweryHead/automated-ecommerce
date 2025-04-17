const mongoose = require('mongoose');

const SEOSettingsSchema = new mongoose.Schema({
  // SEO optimization mode
  optimizationMode: {
    type: String,
    enum: ['continuous', 'scheduled', 'on_demand'],
    default: 'scheduled'
  },
  
  // Scheduled optimization settings
  scheduledOptimization: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      default: 1 // Monday
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 28,
      default: 1
    },
    timeOfDay: {
      type: String,
      default: '02:00' // 2 AM, 24-hour format
    },
    lastRun: {
      type: Date
    },
    nextRun: {
      type: Date
    }
  },
  
  // Continuous optimization settings
  continuousOptimization: {
    checkFrequency: {
      type: Number, // Hours
      default: 24
    },
    minPerformanceThreshold: {
      type: Number, // Minimum score to trigger optimization
      default: 70
    },
    maxOptimizationsPerDay: {
      type: Number,
      default: 5
    }
  },
  
  // SEO elements to optimize
  elements: {
    metaTags: {
      type: Boolean,
      default: true
    },
    headings: {
      type: Boolean,
      default: true
    },
    content: {
      type: Boolean,
      default: true
    },
    images: {
      type: Boolean,
      default: true
    },
    internalLinks: {
      type: Boolean,
      default: true
    },
    structuredData: {
      type: Boolean,
      default: true
    },
    socialMedia: {
      type: Boolean,
      default: true
    }
  },
  
  // Internal linking settings
  internalLinking: {
    enabled: {
      type: Boolean,
      default: true
    },
    maxLinksPerProduct: {
      type: Number,
      default: 5
    },
    minRelevanceScore: {
      type: Number, // 0-100
      default: 70
    },
    requireApproval: {
      type: Boolean,
      default: true
    }
  },
  
  // Performance tracking
  performanceTracking: {
    enabled: {
      type: Boolean,
      default: true
    },
    trackKeywordRankings: {
      type: Boolean,
      default: true
    },
    trackPageSpeed: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Ensure there's only one settings document
SEOSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SEOSettings', SEOSettingsSchema);

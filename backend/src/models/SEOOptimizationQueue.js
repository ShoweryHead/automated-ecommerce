const mongoose = require('mongoose');

const SEOOptimizationQueueSchema = new mongoose.Schema({
  // Target product
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  
  // Optimization type
  optimizationType: {
    type: String,
    enum: ['initial', 'refresh', 'performance_based'],
    default: 'initial'
  },
  
  // Processing status
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  },
  
  // Priority (higher number = higher priority)
  priority: {
    type: Number,
    default: 1
  },
  
  // Result information
  result: {
    changes: {
      type: Map,
      of: String
    },
    performance: {
      before: {
        score: Number,
        issues: [String]
      },
      after: {
        score: Number,
        issues: [String]
      }
    },
    error: String,
    processingTime: Number
  },
  
  // Scheduling
  scheduledFor: {
    type: Date
  },
  
  // Processing timestamps
  queuedAt: {
    type: Date,
    default: Date.now
  },
  processingStartedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SEOOptimizationQueue', SEOOptimizationQueueSchema);

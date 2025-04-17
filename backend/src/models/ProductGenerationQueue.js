const mongoose = require('mongoose');

const ProductGenerationQueueSchema = new mongoose.Schema({
  // Keywords for product generation
  keywords: [{
    type: String,
    required: [true, 'At least one keyword is required']
  }],
  
  // Target category
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
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
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
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

module.exports = mongoose.model('ProductGenerationQueue', ProductGenerationQueueSchema);

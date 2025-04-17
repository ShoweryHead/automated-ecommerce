const mongoose = require('mongoose');

const EmailCampaignSchema = new mongoose.Schema({
  // Campaign name and description
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Campaign type
  type: {
    type: String,
    enum: ['welcome', 'product_announcement', 'inquiry_followup', 'promotional', 'newsletter'],
    required: [true, 'Campaign type is required']
  },
  
  // Campaign content
  template: {
    type: mongoose.Schema.ObjectId,
    ref: 'EmailTemplate',
    required: [true, 'Email template is required']
  },
  
  // Campaign targeting
  segment: {
    type: Object,
    default: {},
    // This will store segmentation criteria as a flexible object
    // e.g., { customerStatus: 'new', interests: ['powder-coating-machines'] }
  },
  
  // Campaign scheduling
  scheduledFor: {
    type: Date
  },
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31
    },
    timeOfDay: {
      type: String,
      default: '09:00' // 9 AM, 24-hour format
    },
    lastSent: {
      type: Date
    },
    nextScheduled: {
      type: Date
    }
  },
  
  // Campaign status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'cancelled'],
    default: 'draft'
  },
  
  // Campaign statistics
  stats: {
    recipients: {
      type: Number,
      default: 0
    },
    opens: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    unsubscribes: {
      type: Number,
      default: 0
    },
    bounces: {
      type: Number,
      default: 0
    }
  },
  
  // Mailchimp integration
  mailchimpCampaignId: {
    type: String
  },
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailCampaign', EmailCampaignSchema);

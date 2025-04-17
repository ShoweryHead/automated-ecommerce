const mongoose = require('mongoose');

const EmailSubscriberSchema = new mongoose.Schema({
  // Subscriber information
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Subscription status
  status: {
    type: String,
    enum: ['subscribed', 'unsubscribed', 'pending', 'cleaned'],
    default: 'subscribed'
  },
  
  // Segmentation data
  customerStatus: {
    type: String,
    enum: ['new', 'existing', 'inactive'],
    default: 'new'
  },
  interests: {
    type: [String],
    default: []
  },
  region: {
    type: String,
    trim: true
  },
  engagementLevel: {
    type: String,
    enum: ['high', 'medium', 'low', 'none'],
    default: 'none'
  },
  
  // Tracking data
  lastEngagement: {
    type: Date
  },
  source: {
    type: String,
    enum: ['website', 'inquiry', 'manual', 'import'],
    default: 'website'
  },
  
  // Mailchimp integration
  mailchimpId: {
    type: String
  },
  mailchimpListId: {
    type: String
  },
  
  // Activity history
  activityHistory: [{
    action: {
      type: String,
      enum: ['subscribed', 'unsubscribed', 'opened', 'clicked', 'bounced', 'complained']
    },
    campaign: {
      type: mongoose.Schema.ObjectId,
      ref: 'EmailCampaign'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: String
    }
  }],
  
  // Consent and GDPR
  consentGiven: {
    type: Boolean,
    default: false
  },
  consentTimestamp: {
    type: Date
  },
  consentIP: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailSubscriber', EmailSubscriberSchema);

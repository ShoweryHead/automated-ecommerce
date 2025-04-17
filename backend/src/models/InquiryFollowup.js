const mongoose = require('mongoose');

const InquiryFollowupSchema = new mongoose.Schema({
  // Related inquiry
  inquiry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry',
    required: true
  },
  
  // Follow-up status
  status: {
    type: String,
    enum: ['pending', 'sent', 'responded', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Follow-up type
  type: {
    type: String,
    enum: ['auto_response', 'reminder', 'quote_followup', 'thank_you'],
    required: true
  },
  
  // Communication channel
  channel: {
    type: String,
    enum: ['email', 'whatsapp', 'sms'],
    required: true
  },
  
  // Scheduled send time
  scheduledTime: {
    type: Date,
    required: true
  },
  
  // Actual send time
  sentTime: {
    type: Date
  },
  
  // Message content
  content: {
    subject: {
      type: String,
      trim: true
    },
    body: {
      type: String,
      required: true
    },
    includedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  },
  
  // Recipient information
  recipient: {
    name: {
      type: String,
      trim: true,
      required: true
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  
  // Response tracking
  response: {
    received: {
      type: Boolean,
      default: false
    },
    receivedTime: {
      type: Date
    },
    content: {
      type: String
    }
  },
  
  // Metadata
  metadata: {
    templateUsed: {
      type: String,
      trim: true
    },
    customFields: {
      type: Map,
      of: String
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

// Create index for finding pending follow-ups
InquiryFollowupSchema.index({ status: 1, scheduledTime: 1 });

module.exports = mongoose.model('InquiryFollowup', InquiryFollowupSchema);

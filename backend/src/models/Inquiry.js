const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  // Customer information
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  
  // Inquiry details
  subject: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Products inquired about
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  
  // Inquiry status
  status: {
    type: String,
    enum: ['new', 'in_progress', 'quoted', 'converted', 'closed', 'spam'],
    default: 'new'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Source of inquiry
  source: {
    type: String,
    enum: ['website', 'email', 'whatsapp', 'phone', 'social_media', 'other'],
    default: 'website'
  },
  
  // Assigned staff member
  assignedTo: {
    type: String,
    trim: true
  },
  
  // Follow-up tracking
  followUp: {
    lastFollowUp: {
      type: Date
    },
    nextFollowUp: {
      type: Date
    },
    followUpCount: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true
    }
  },
  
  // Communication history
  communications: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['email', 'whatsapp', 'phone', 'in_person', 'other'],
      required: true
    },
    direction: {
      type: String,
      enum: ['incoming', 'outgoing'],
      required: true
    },
    content: {
      type: String,
      trim: true
    },
    attachments: [{
      name: {
        type: String,
        trim: true
      },
      url: {
        type: String,
        trim: true
      }
    }],
    performedBy: {
      type: String,
      trim: true
    }
  }],
  
  // Automation tracking
  automation: {
    autoResponseSent: {
      type: Boolean,
      default: false
    },
    autoResponseTime: {
      type: Date
    },
    followUpScheduled: {
      type: Boolean,
      default: false
    },
    followUpEmailsSent: {
      type: Number,
      default: 0
    },
    lastAutomatedAction: {
      type: Date
    }
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],
  
  // Additional notes
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes for common queries
InquirySchema.index({ 'customer.email': 1 });
InquirySchema.index({ status: 1 });
InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ 'followUp.nextFollowUp': 1 });

module.exports = mongoose.model('Inquiry', InquirySchema);

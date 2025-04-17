const mongoose = require('mongoose');

const SocialMediaPostSchema = new mongoose.Schema({
  // Post content
  content: {
    text: {
      type: String,
      required: true,
      trim: true
    },
    hashtags: [{
      type: String,
      trim: true
    }],
    callToAction: {
      type: String,
      trim: true
    }
  },
  
  // Media attachments
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'gif', 'link'],
      required: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    altText: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    }
  }],
  
  // Related content
  relatedTo: {
    type: {
      type: String,
      enum: ['product', 'blog', 'category', 'promotion', 'general'],
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    blogPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost'
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }
  },
  
  // Platforms to post to
  platforms: [{
    name: {
      type: String,
      enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'pinterest'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'posted', 'failed', 'scheduled'],
      default: 'pending'
    },
    postId: {
      type: String,
      trim: true
    },
    postUrl: {
      type: String,
      trim: true
    },
    scheduledTime: {
      type: Date
    },
    postedTime: {
      type: Date
    },
    error: {
      type: String,
      trim: true
    }
  }],
  
  // Post status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'posted', 'failed'],
    default: 'draft'
  },
  
  // Scheduling
  scheduledTime: {
    type: Date
  },
  
  // Performance metrics
  metrics: {
    impressions: {
      type: Number,
      default: 0
    },
    engagements: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date
    }
  },
  
  // Automation tracking
  automation: {
    isAutomated: {
      type: Boolean,
      default: false
    },
    generatedFrom: {
      type: String,
      enum: ['product', 'blog', 'promotion', 'manual'],
      default: 'manual'
    },
    templateUsed: {
      type: String,
      trim: true
    },
    generationTime: {
      type: Date
    }
  },
  
  // Creation and modification info
  createdBy: {
    type: String,
    default: 'system',
    trim: true
  },
  lastModifiedBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create indexes for common queries
SocialMediaPostSchema.index({ status: 1, scheduledTime: 1 });
SocialMediaPostSchema.index({ 'relatedTo.type': 1, 'relatedTo.productId': 1 });
SocialMediaPostSchema.index({ 'relatedTo.type': 1, 'relatedTo.blogPostId': 1 });

module.exports = mongoose.model('SocialMediaPost', SocialMediaPostSchema);

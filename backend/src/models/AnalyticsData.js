const mongoose = require('mongoose');

const AnalyticsDataSchema = new mongoose.Schema({
  // Date range
  dateRange: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  
  // Traffic metrics
  traffic: {
    totalVisits: {
      type: Number,
      default: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0
    },
    pageViews: {
      type: Number,
      default: 0
    },
    avgSessionDuration: {
      type: Number, // in seconds
      default: 0
    },
    bounceRate: {
      type: Number, // percentage
      default: 0
    },
    topReferrers: [{
      source: {
        type: String,
        trim: true
      },
      visits: {
        type: Number,
        default: 0
      }
    }],
    deviceBreakdown: {
      desktop: {
        type: Number, // percentage
        default: 0
      },
      mobile: {
        type: Number, // percentage
        default: 0
      },
      tablet: {
        type: Number, // percentage
        default: 0
      }
    },
    geographicData: [{
      country: {
        type: String,
        trim: true
      },
      visits: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Product metrics
  products: {
    mostViewed: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      views: {
        type: Number,
        default: 0
      }
    }],
    mostInquired: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      inquiries: {
        type: Number,
        default: 0
      }
    }],
    categoryPerformance: [{
      category: {
        type: String,
        trim: true
      },
      views: {
        type: Number,
        default: 0
      },
      inquiries: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Inquiry metrics
  inquiries: {
    total: {
      type: Number,
      default: 0
    },
    byStatus: {
      new: {
        type: Number,
        default: 0
      },
      inProgress: {
        type: Number,
        default: 0
      },
      quoted: {
        type: Number,
        default: 0
      },
      converted: {
        type: Number,
        default: 0
      },
      closed: {
        type: Number,
        default: 0
      }
    },
    conversionRate: {
      type: Number, // percentage
      default: 0
    },
    avgResponseTime: {
      type: Number, // in hours
      default: 0
    },
    bySource: [{
      source: {
        type: String,
        trim: true
      },
      count: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Content metrics
  content: {
    blogPerformance: [{
      blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogPost'
      },
      views: {
        type: Number,
        default: 0
      },
      avgTimeOnPage: {
        type: Number, // in seconds
        default: 0
      },
      inquiriesGenerated: {
        type: Number,
        default: 0
      }
    }],
    searchTerms: [{
      term: {
        type: String,
        trim: true
      },
      count: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Email metrics
  email: {
    campaigns: [{
      campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmailCampaign'
      },
      sent: {
        type: Number,
        default: 0
      },
      opened: {
        type: Number,
        default: 0
      },
      clicked: {
        type: Number,
        default: 0
      },
      inquiriesGenerated: {
        type: Number,
        default: 0
      }
    }],
    overallOpenRate: {
      type: Number, // percentage
      default: 0
    },
    overallClickRate: {
      type: Number, // percentage
      default: 0
    },
    subscriberGrowth: {
      type: Number,
      default: 0
    }
  },
  
  // Social media metrics
  socialMedia: {
    postPerformance: [{
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialMediaPost'
      },
      platform: {
        type: String,
        trim: true
      },
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
      inquiriesGenerated: {
        type: Number,
        default: 0
      }
    }],
    platformBreakdown: [{
      platform: {
        type: String,
        trim: true
      },
      traffic: {
        type: Number,
        default: 0
      },
      inquiries: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // SEO metrics
  seo: {
    organicTraffic: {
      type: Number,
      default: 0
    },
    keywordRankings: [{
      keyword: {
        type: String,
        trim: true
      },
      position: {
        type: Number,
        default: 0
      },
      change: {
        type: Number,
        default: 0
      }
    }],
    topLandingPages: [{
      page: {
        type: String,
        trim: true
      },
      visits: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Report metadata
  metadata: {
    reportType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'custom'],
      required: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    generatedBy: {
      type: String,
      default: 'system',
      trim: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AnalyticsData', AnalyticsDataSchema);

const mongoose = require('mongoose');

const AnalyticsSettingsSchema = new mongoose.Schema({
  // Global settings
  enabled: {
    type: Boolean,
    default: true
  },
  
  // Report generation settings
  reportGeneration: {
    daily: {
      enabled: {
        type: Boolean,
        default: false
      },
      time: {
        type: String,
        default: '06:00'
      },
      recipients: [{
        type: String,
        trim: true
      }]
    },
    weekly: {
      enabled: {
        type: Boolean,
        default: true
      },
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: 'monday'
      },
      time: {
        type: String,
        default: '08:00'
      },
      recipients: [{
        type: String,
        trim: true
      }]
    },
    monthly: {
      enabled: {
        type: Boolean,
        default: true
      },
      dayOfMonth: {
        type: Number,
        min: 1,
        max: 31,
        default: 1
      },
      time: {
        type: String,
        default: '08:00'
      },
      recipients: [{
        type: String,
        trim: true
      }]
    },
    quarterly: {
      enabled: {
        type: Boolean,
        default: false
      },
      recipients: [{
        type: String,
        trim: true
      }]
    }
  },
  
  // Data collection settings
  dataCollection: {
    googleAnalytics: {
      enabled: {
        type: Boolean,
        default: true
      },
      trackingId: {
        type: String,
        trim: true
      },
      viewId: {
        type: String,
        trim: true
      },
      apiKey: {
        type: String,
        trim: true,
        select: false
      }
    },
    internalTracking: {
      enabled: {
        type: Boolean,
        default: true
      },
      trackPageViews: {
        type: Boolean,
        default: true
      },
      trackInquiries: {
        type: Boolean,
        default: true
      },
      trackProductViews: {
        type: Boolean,
        default: true
      },
      trackSearches: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Report content settings
  reportContent: {
    includeTrafficMetrics: {
      type: Boolean,
      default: true
    },
    includeProductMetrics: {
      type: Boolean,
      default: true
    },
    includeInquiryMetrics: {
      type: Boolean,
      default: true
    },
    includeContentMetrics: {
      type: Boolean,
      default: true
    },
    includeEmailMetrics: {
      type: Boolean,
      default: true
    },
    includeSocialMediaMetrics: {
      type: Boolean,
      default: true
    },
    includeSEOMetrics: {
      type: Boolean,
      default: true
    },
    topProductsCount: {
      type: Number,
      default: 10,
      min: 1,
      max: 50
    },
    topCategoriesCount: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    },
    topBlogPostsCount: {
      type: Number,
      default: 5,
      min: 1,
      max: 20
    }
  },
  
  // Email delivery settings
  emailDelivery: {
    template: {
      subject: {
        type: String,
        default: '{report_type} Performance Report - {date_range}'
      },
      introduction: {
        type: String,
        default: 'Here is your {report_type} performance report for {date_range}. Below you will find key metrics and insights about your website\'s performance.'
      },
      conclusion: {
        type: String,
        default: 'For more detailed analytics, please visit your admin dashboard.'
      }
    },
    includeAttachments: {
      type: Boolean,
      default: true
    },
    attachmentFormat: {
      type: String,
      enum: ['pdf', 'csv', 'both'],
      default: 'pdf'
    }
  },
  
  // Dashboard settings
  dashboard: {
    defaultDateRange: {
      type: String,
      enum: ['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'custom'],
      default: 'last30days'
    },
    refreshInterval: {
      type: Number, // in minutes
      default: 60,
      min: 5
    },
    widgets: {
      trafficOverview: {
        enabled: {
          type: Boolean,
          default: true
        },
        position: {
          type: Number,
          default: 1
        }
      },
      topProducts: {
        enabled: {
          type: Boolean,
          default: true
        },
        position: {
          type: Number,
          default: 2
        }
      },
      inquiryMetrics: {
        enabled: {
          type: Boolean,
          default: true
        },
        position: {
          type: Number,
          default: 3
        }
      },
      conversionFunnel: {
        enabled: {
          type: Boolean,
          default: true
        },
        position: {
          type: Number,
          default: 4
        }
      },
      recentInquiries: {
        enabled: {
          type: Boolean,
          default: true
        },
        position: {
          type: Number,
          default: 5
        }
      },
      geographicMap: {
        enabled: {
          type: Boolean,
          default: true
        },
        position: {
          type: Number,
          default: 6
        }
      }
    }
  },
  
  // Alert settings
  alerts: {
    enabled: {
      type: Boolean,
      default: true
    },
    trafficDrop: {
      enabled: {
        type: Boolean,
        default: true
      },
      threshold: {
        type: Number, // percentage
        default: 20
      }
    },
    inquiryDrop: {
      enabled: {
        type: Boolean,
        default: true
      },
      threshold: {
        type: Number, // percentage
        default: 20
      }
    },
    conversionRateDrop: {
      enabled: {
        type: Boolean,
        default: true
      },
      threshold: {
        type: Number, // percentage
        default: 15
      }
    },
    recipients: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AnalyticsSettings', AnalyticsSettingsSchema);

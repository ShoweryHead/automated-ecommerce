const mongoose = require('mongoose');

const BlogAutomationSettingsSchema = new mongoose.Schema({
  // General settings
  enabled: {
    type: Boolean,
    default: true
  },
  
  // Content generation settings
  contentTypes: {
    product: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
        default: 'biweekly'
      },
      minWordCount: {
        type: Number,
        default: 800
      },
      maxWordCount: {
        type: Number,
        default: 1500
      },
      promptTemplate: {
        type: String,
        default: 'Write a comprehensive product-focused article about {product_name}. Include detailed specifications, use cases, benefits, and comparisons with similar products. The article should be informative and persuasive, highlighting the unique selling points of the product.'
      }
    },
    industry_news: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
        default: 'weekly'
      },
      minWordCount: {
        type: Number,
        default: 600
      },
      maxWordCount: {
        type: Number,
        default: 1200
      },
      promptTemplate: {
        type: String,
        default: 'Write an informative article about the latest trends and developments in the coating industry, focusing on {topic}. Include recent innovations, market changes, and expert insights. The article should position the company as knowledgeable and up-to-date with industry developments.'
      }
    },
    how_to: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
        default: 'biweekly'
      },
      minWordCount: {
        type: Number,
        default: 1000
      },
      maxWordCount: {
        type: Number,
        default: 2000
      },
      promptTemplate: {
        type: String,
        default: 'Create a detailed step-by-step guide on {topic} related to coating machines. Include practical tips, best practices, troubleshooting advice, and safety considerations. The guide should be educational and position the company as an expert in the field.'
      }
    },
    case_study: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
        default: 'monthly'
      },
      minWordCount: {
        type: Number,
        default: 1200
      },
      maxWordCount: {
        type: Number,
        default: 2500
      },
      promptTemplate: {
        type: String,
        default: 'Write a detailed case study about how {client_name} successfully implemented {product_name} to solve their business challenges. Include the initial problem, solution implementation, results achieved, and testimonials. The case study should demonstrate real-world value and success stories.'
      }
    }
  },
  
  // Publishing settings
  publishingSchedule: {
    daysOfWeek: {
      type: [Number], // 0 = Sunday, 1 = Monday, etc.
      default: [1, 3, 5] // Monday, Wednesday, Friday
    },
    timeOfDay: {
      type: String,
      default: '09:00' // 9 AM, 24-hour format
    },
    maxPostsPerWeek: {
      type: Number,
      default: 2
    },
    minDaysBetweenPosts: {
      type: Number,
      default: 3
    }
  },
  
  // Review workflow settings
  reviewWorkflow: {
    requireReview: {
      type: Boolean,
      default: true
    },
    autoPublishAfterApproval: {
      type: Boolean,
      default: true
    },
    notifyReviewersEmail: {
      type: Boolean,
      default: true
    },
    reviewers: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    reviewReminderDays: {
      type: Number,
      default: 2 // Send reminder if not reviewed within 2 days
    }
  },
  
  // SEO settings
  seoSettings: {
    autoGenerateMetaTags: {
      type: Boolean,
      default: true
    },
    focusKeywordSource: {
      type: String,
      enum: ['auto', 'manual', 'hybrid'],
      default: 'hybrid'
    },
    longTailKeywordsCount: {
      type: Number,
      default: 3
    },
    internalLinkingEnabled: {
      type: Boolean,
      default: true
    },
    minInternalLinks: {
      type: Number,
      default: 2
    },
    maxInternalLinks: {
      type: Number,
      default: 5
    },
    autoGenerateSchema: {
      type: Boolean,
      default: true
    }
  },
  
  // Email promotion settings
  emailPromotion: {
    enabled: {
      type: Boolean,
      default: true
    },
    promotionDelay: {
      type: Number,
      default: 1 // Days after publishing
    },
    includeInNewsletter: {
      type: Boolean,
      default: true
    },
    dedicatedEmailForFeatured: {
      type: Boolean,
      default: false
    },
    emailTemplate: {
      type: mongoose.Schema.ObjectId,
      ref: 'EmailTemplate'
    }
  },
  
  // Content generation API settings
  contentGenerationAPI: {
    provider: {
      type: String,
      enum: ['openai', 'anthropic', 'custom'],
      default: 'openai'
    },
    model: {
      type: String,
      default: 'gpt-4'
    },
    temperature: {
      type: Number,
      default: 0.7
    },
    maxTokens: {
      type: Number,
      default: 4000
    },
    apiKey: {
      type: String,
      select: false // Don't return API key in queries
    }
  },
  
  // Image generation settings
  imageGeneration: {
    enabled: {
      type: Boolean,
      default: true
    },
    provider: {
      type: String,
      enum: ['openai', 'stability', 'custom'],
      default: 'openai'
    },
    featuredImagePromptTemplate: {
      type: String,
      default: 'Create a professional, high-quality image for a blog post about {topic} in the coating machines industry. The image should be clean, modern, and suitable for a technical business audience.'
    },
    additionalImagesCount: {
      type: Number,
      default: 2
    },
    imageStyle: {
      type: String,
      default: 'professional, technical, clean, high-quality'
    }
  },
  
  // Topic generation settings
  topicGeneration: {
    enabled: {
      type: Boolean,
      default: true
    },
    suggestTopicsFrequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'biweekly'
    },
    topicsPerBatch: {
      type: Number,
      default: 5
    },
    basedOnProducts: {
      type: Boolean,
      default: true
    },
    basedOnTrends: {
      type: Boolean,
      default: true
    },
    basedOnKeywords: {
      type: Boolean,
      default: true
    }
  },
  
  // Last updated information
  lastUpdatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BlogAutomationSettings', BlogAutomationSettingsSchema);

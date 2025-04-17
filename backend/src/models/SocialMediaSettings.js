const mongoose = require('mongoose');

const SocialMediaSettingsSchema = new mongoose.Schema({
  // Global settings
  enabled: {
    type: Boolean,
    default: true
  },
  
  // Platform credentials and settings
  platforms: {
    facebook: {
      enabled: {
        type: Boolean,
        default: false
      },
      pageId: {
        type: String,
        trim: true
      },
      accessToken: {
        type: String,
        trim: true,
        select: false
      },
      pageName: {
        type: String,
        trim: true
      }
    },
    instagram: {
      enabled: {
        type: Boolean,
        default: false
      },
      businessAccountId: {
        type: String,
        trim: true
      },
      accessToken: {
        type: String,
        trim: true,
        select: false
      },
      username: {
        type: String,
        trim: true
      }
    },
    twitter: {
      enabled: {
        type: Boolean,
        default: false
      },
      apiKey: {
        type: String,
        trim: true,
        select: false
      },
      apiKeySecret: {
        type: String,
        trim: true,
        select: false
      },
      accessToken: {
        type: String,
        trim: true,
        select: false
      },
      accessTokenSecret: {
        type: String,
        trim: true,
        select: false
      },
      username: {
        type: String,
        trim: true
      }
    },
    linkedin: {
      enabled: {
        type: Boolean,
        default: false
      },
      companyId: {
        type: String,
        trim: true
      },
      accessToken: {
        type: String,
        trim: true,
        select: false
      },
      companyName: {
        type: String,
        trim: true
      }
    },
    pinterest: {
      enabled: {
        type: Boolean,
        default: false
      },
      businessAccountId: {
        type: String,
        trim: true
      },
      accessToken: {
        type: String,
        trim: true,
        select: false
      },
      username: {
        type: String,
        trim: true
      }
    }
  },
  
  // Auto-posting settings for new products
  productPosting: {
    enabled: {
      type: Boolean,
      default: true
    },
    platforms: {
      facebook: {
        type: Boolean,
        default: true
      },
      instagram: {
        type: Boolean,
        default: true
      },
      twitter: {
        type: Boolean,
        default: true
      },
      linkedin: {
        type: Boolean,
        default: true
      },
      pinterest: {
        type: Boolean,
        default: true
      }
    },
    templates: {
      default: {
        text: {
          type: String,
          default: 'Check out our new product: {product_name}! {product_description} #NewProduct #IndustrialEquipment'
        },
        callToAction: {
          type: String,
          default: 'DM us or click the link to inquire about this product!'
        }
      },
      facebook: {
        text: {
          type: String,
          default: 'New Product Alert! 🔔\n\n{product_name}\n\n{product_description}\n\nInterested? Send us a message or click the link to inquire!'
        }
      },
      instagram: {
        text: {
          type: String,
          default: '🆕 New Product Alert! 🔔\n\n{product_name}\n\n{product_description}\n\n#NewProduct #IndustrialEquipment #{product_category} #Manufacturing\n\nDM us for more information!'
        }
      },
      twitter: {
        text: {
          type: String,
          default: 'New Product Alert! 🔔 {product_name}\n\n{product_short_description}\n\n#NewProduct #{product_category}'
        }
      },
      linkedin: {
        text: {
          type: String,
          default: 'We\'re excited to introduce our new {product_name}!\n\n{product_description}\n\nThis industrial solution is perfect for {product_use_case}.\n\nContact us to learn more about specifications and how this product can benefit your operations.'
        }
      },
      pinterest: {
        text: {
          type: String,
          default: '{product_name} - Industrial Equipment\n\n{product_short_description}\n\n#IndustrialEquipment #{product_category}'
        }
      }
    },
    hashtagGeneration: {
      enabled: {
        type: Boolean,
        default: true
      },
      maxHashtags: {
        type: Number,
        default: 5,
        min: 1,
        max: 30
      },
      defaultHashtags: [{
        type: String,
        trim: true
      }]
    },
    scheduling: {
      postImmediately: {
        type: Boolean,
        default: false
      },
      bestTimeToPost: {
        type: Boolean,
        default: true
      },
      customTime: {
        hour: {
          type: Number,
          min: 0,
          max: 23,
          default: 10
        },
        minute: {
          type: Number,
          min: 0,
          max: 59,
          default: 0
        }
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    }
  },
  
  // Auto-posting settings for new blog posts
  blogPosting: {
    enabled: {
      type: Boolean,
      default: true
    },
    platforms: {
      facebook: {
        type: Boolean,
        default: true
      },
      twitter: {
        type: Boolean,
        default: true
      },
      linkedin: {
        type: Boolean,
        default: true
      },
      pinterest: {
        type: Boolean,
        default: false
      }
    },
    templates: {
      default: {
        text: {
          type: String,
          default: 'New on our blog: {blog_title}. {blog_excerpt} Read more at the link! #IndustryInsights'
        },
        callToAction: {
          type: String,
          default: 'Read the full article on our website!'
        }
      },
      facebook: {
        text: {
          type: String,
          default: '📝 New Blog Post: {blog_title}\n\n{blog_excerpt}\n\nRead the full article on our website! #IndustryInsights'
        }
      },
      twitter: {
        text: {
          type: String,
          default: 'New on our blog: {blog_title}\n\n{blog_short_excerpt}\n\nRead more at the link! #IndustryInsights'
        }
      },
      linkedin: {
        text: {
          type: String,
          default: '📝 New Article: {blog_title}\n\n{blog_excerpt}\n\nRead the full article to learn more about {blog_topic}.\n\n#IndustryInsights #IndustrialEquipment'
        }
      }
    },
    hashtagGeneration: {
      enabled: {
        type: Boolean,
        default: true
      },
      maxHashtags: {
        type: Number,
        default: 5,
        min: 1,
        max: 30
      },
      defaultHashtags: [{
        type: String,
        trim: true
      }]
    },
    scheduling: {
      postImmediately: {
        type: Boolean,
        default: false
      },
      bestTimeToPost: {
        type: Boolean,
        default: true
      },
      customTime: {
        hour: {
          type: Number,
          min: 0,
          max: 23,
          default: 14
        },
        minute: {
          type: Number,
          min: 0,
          max: 59,
          default: 0
        }
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    }
  },
  
  // Content generation settings
  contentGeneration: {
    enabled: {
      type: Boolean,
      default: true
    },
    aiGeneration: {
      enabled: {
        type: Boolean,
        default: true
      },
      model: {
        type: String,
        default: 'gpt-4',
        enum: ['gpt-3.5-turbo', 'gpt-4', 'custom']
      },
      customEndpoint: {
        type: String,
        trim: true
      },
      apiKey: {
        type: String,
        trim: true,
        select: false
      }
    },
    imageGeneration: {
      enabled: {
        type: Boolean,
        default: true
      },
      useProductImages: {
        type: Boolean,
        default: true
      },
      useBlogImages: {
        type: Boolean,
        default: true
      },
      generateCustomImages: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Posting frequency limits
  postingLimits: {
    maxPostsPerDay: {
      type: Number,
      default: 3,
      min: 1
    },
    minHoursBetweenPosts: {
      type: Number,
      default: 4,
      min: 1
    },
    maxPostsPerPlatformPerDay: {
      facebook: {
        type: Number,
        default: 2,
        min: 1
      },
      instagram: {
        type: Number,
        default: 1,
        min: 1
      },
      twitter: {
        type: Number,
        default: 3,
        min: 1
      },
      linkedin: {
        type: Number,
        default: 1,
        min: 1
      },
      pinterest: {
        type: Number,
        default: 2,
        min: 1
      }
    }
  },
  
  // URL shortening
  urlShortening: {
    enabled: {
      type: Boolean,
      default: false
    },
    service: {
      type: String,
      enum: ['bitly', 'tinyurl', 'custom', 'none'],
      default: 'none'
    },
    apiKey: {
      type: String,
      trim: true,
      select: false
    },
    customDomain: {
      type: String,
      trim: true
    }
  },
  
  // UTM parameters for tracking
  utmParameters: {
    enabled: {
      type: Boolean,
      default: true
    },
    source: {
      type: String,
      default: '{platform}'
    },
    medium: {
      type: String,
      default: 'social'
    },
    campaign: {
      type: String,
      default: '{content_type}'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SocialMediaSettings', SocialMediaSettingsSchema);

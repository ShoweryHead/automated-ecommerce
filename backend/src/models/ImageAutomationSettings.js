const mongoose = require('mongoose');

const ImageAutomationSettingsSchema = new mongoose.Schema({
  // General settings
  enabled: {
    type: Boolean,
    default: true
  },
  
  // Image types settings
  imageTypes: {
    product: {
      enabled: {
        type: Boolean,
        default: true
      },
      preferredSource: {
        type: String,
        enum: ['stock', 'ai_generated', 'hybrid'],
        default: 'hybrid'
      },
      dimensions: {
        width: {
          type: Number,
          default: 800
        },
        height: {
          type: Number,
          default: 800
        }
      },
      maxImagesPerProduct: {
        type: Number,
        default: 5
      },
      styleKeywords: [{
        type: String,
        trim: true
      }]
    },
    blog: {
      enabled: {
        type: Boolean,
        default: true
      },
      preferredSource: {
        type: String,
        enum: ['stock', 'ai_generated', 'hybrid'],
        default: 'stock'
      },
      dimensions: {
        width: {
          type: Number,
          default: 1200
        },
        height: {
          type: Number,
          default: 630
        }
      },
      maxImagesPerPost: {
        type: Number,
        default: 3
      },
      styleKeywords: [{
        type: String,
        trim: true
      }]
    },
    category: {
      enabled: {
        type: Boolean,
        default: true
      },
      preferredSource: {
        type: String,
        enum: ['stock', 'ai_generated', 'hybrid'],
        default: 'stock'
      },
      dimensions: {
        width: {
          type: Number,
          default: 1600
        },
        height: {
          type: Number,
          default: 400
        }
      },
      styleKeywords: [{
        type: String,
        trim: true
      }]
    },
    social: {
      enabled: {
        type: Boolean,
        default: true
      },
      preferredSource: {
        type: String,
        enum: ['stock', 'ai_generated', 'hybrid'],
        default: 'ai_generated'
      },
      dimensions: {
        width: {
          type: Number,
          default: 1200
        },
        height: {
          type: Number,
          default: 630
        }
      },
      styleKeywords: [{
        type: String,
        trim: true
      }]
    }
  },
  
  // Stock image API settings
  stockImageAPI: {
    provider: {
      type: String,
      enum: ['unsplash', 'pexels', 'pixabay', 'shutterstock', 'other'],
      default: 'unsplash'
    },
    apiKey: {
      type: String,
      select: false // Don't return API key in queries
    },
    searchParams: {
      defaultQuery: {
        type: String,
        default: 'coating machine industrial'
      },
      orientation: {
        type: String,
        enum: ['landscape', 'portrait', 'square', 'any'],
        default: 'any'
      },
      color: {
        type: String,
        default: ''
      },
      safeSearch: {
        type: Boolean,
        default: true
      },
      maxResults: {
        type: Number,
        default: 10
      }
    }
  },
  
  // AI image generation settings
  aiGenerationAPI: {
    provider: {
      type: String,
      enum: ['openai', 'stability', 'midjourney', 'other'],
      default: 'openai'
    },
    model: {
      type: String,
      default: 'dall-e-3'
    },
    apiKey: {
      type: String,
      select: false // Don't return API key in queries
    },
    defaultPromptTemplate: {
      type: String,
      default: 'A professional, clean, high-quality image of {subject} with an industrial aesthetic. The image should be well-lit, with a clean background, showing {subject} in detail.'
    },
    stylePreset: {
      type: String,
      default: 'photographic'
    },
    negativePrompt: {
      type: String,
      default: 'text, watermarks, low quality, blurry, distorted'
    }
  },
  
  // Optimization settings
  optimization: {
    enabled: {
      type: Boolean,
      default: true
    },
    compressionLevel: {
      type: Number,
      min: 1,
      max: 100,
      default: 80
    },
    preferredFormat: {
      type: String,
      enum: ['jpeg', 'png', 'webp', 'avif', 'original'],
      default: 'webp'
    },
    convertToWebP: {
      type: Boolean,
      default: true
    },
    generateResponsiveSizes: {
      type: Boolean,
      default: true
    },
    responsiveSizes: [{
      name: {
        type: String,
        trim: true
      },
      width: {
        type: Number
      },
      height: {
        type: Number
      }
    }],
    preserveMetadata: {
      type: Boolean,
      default: false
    },
    stripExif: {
      type: Boolean,
      default: true
    }
  },
  
  // SEO settings
  seo: {
    generateAltText: {
      type: Boolean,
      default: true
    },
    altTextTemplate: {
      type: String,
      default: '{product_name} - {category_name} - high quality industrial coating machine'
    },
    includeKeywordsInFilename: {
      type: Boolean,
      default: true
    },
    filenameTemplate: {
      type: String,
      default: '{entity_type}-{entity_name}-{timestamp}'
    }
  },
  
  // Storage settings
  storage: {
    storageType: {
      type: String,
      enum: ['local', 's3', 'cloudinary', 'other'],
      default: 'local'
    },
    basePath: {
      type: String,
      default: '/images'
    },
    folderStructure: {
      type: String,
      default: '{type}/{entity_type}/{date}'
    },
    s3Bucket: {
      type: String
    },
    s3Region: {
      type: String
    },
    cloudName: {
      type: String
    }
  },
  
  // Style guidelines
  styleGuidelines: {
    colorPalette: [{
      name: {
        type: String,
        trim: true
      },
      hexCode: {
        type: String,
        trim: true
      }
    }],
    preferredStyle: {
      type: String,
      default: 'professional, clean, industrial'
    },
    avoidStyles: {
      type: String,
      default: 'cartoon, abstract, low quality'
    },
    backgroundPreference: {
      type: String,
      enum: ['white', 'transparent', 'gradient', 'contextual', 'none'],
      default: 'white'
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

// Set default style keywords for each image type
ImageAutomationSettingsSchema.pre('save', function(next) {
  if (!this.imageTypes.product.styleKeywords || this.imageTypes.product.styleKeywords.length === 0) {
    this.imageTypes.product.styleKeywords = ['professional', 'clean', 'industrial', 'detailed', 'machinery'];
  }
  
  if (!this.imageTypes.blog.styleKeywords || this.imageTypes.blog.styleKeywords.length === 0) {
    this.imageTypes.blog.styleKeywords = ['informative', 'professional', 'industrial', 'technical', 'clean'];
  }
  
  if (!this.imageTypes.category.styleKeywords || this.imageTypes.category.styleKeywords.length === 0) {
    this.imageTypes.category.styleKeywords = ['panoramic', 'industrial', 'professional', 'machinery', 'wide'];
  }
  
  if (!this.imageTypes.social.styleKeywords || this.imageTypes.social.styleKeywords.length === 0) {
    this.imageTypes.social.styleKeywords = ['engaging', 'professional', 'clean', 'promotional', 'eye-catching'];
  }
  
  next();
});

// Set default responsive sizes if not provided
ImageAutomationSettingsSchema.pre('save', function(next) {
  if (!this.optimization.responsiveSizes || this.optimization.responsiveSizes.length === 0) {
    this.optimization.responsiveSizes = [
      { name: 'thumbnail', width: 150, height: 150 },
      { name: 'small', width: 300, height: 300 },
      { name: 'medium', width: 600, height: 600 },
      { name: 'large', width: 1200, height: 1200 }
    ];
  }
  
  next();
});

// Set default color palette if not provided
ImageAutomationSettingsSchema.pre('save', function(next) {
  if (!this.styleGuidelines.colorPalette || this.styleGuidelines.colorPalette.length === 0) {
    this.styleGuidelines.colorPalette = [
      { name: 'primary', hexCode: '#0056b3' },
      { name: 'secondary', hexCode: '#6c757d' },
      { name: 'accent', hexCode: '#ffc107' },
      { name: 'light', hexCode: '#f8f9fa' },
      { name: 'dark', hexCode: '#343a40' }
    ];
  }
  
  next();
});

module.exports = mongoose.model('ImageAutomationSettings', ImageAutomationSettingsSchema);

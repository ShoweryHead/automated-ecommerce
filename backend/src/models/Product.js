const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // Basic product information
  title: {
    type: String,
    required: [true, 'Please add a product title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  shortDescription: {
    type: String,
    required: [true, 'Please add a short description'],
    maxlength: [500, 'Short description cannot be more than 500 characters']
  },
  
  // Product details
  features: [{
    title: String,
    items: [String]
  }],
  specifications: {
    type: Map,
    of: String
  },
  applications: [{
    type: String
  }],
  faqs: [{
    question: String,
    answer: String
  }],
  
  // Categorization
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true
  },
  
  // Media
  images: [{
    url: String,
    alt: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  
  // SEO fields
  metaTitle: {
    type: String,
    maxlength: [70, 'Meta title cannot be more than 70 characters']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot be more than 160 characters']
  },
  keywords: [{
    type: String
  }],
  schemaMarkup: {
    type: String
  },
  
  // Automation fields
  isAutomated: {
    type: Boolean,
    default: true
  },
  sourceKeywords: [{
    type: String
  }],
  generationStatus: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending'
  },
  generationErrors: [{
    type: String
  }],
  
  // Publication fields
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published'],
    default: 'draft'
  },
  scheduledPublishDate: {
    type: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date
  },
  seoLastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create slug from title
ProductSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    next();
    return;
  }
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  next();
});

module.exports = mongoose.model('Product', ProductSchema);

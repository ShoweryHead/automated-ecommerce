const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema({
  // Template name and description
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Template type
  type: {
    type: String,
    enum: ['welcome', 'product_announcement', 'inquiry_followup', 'promotional', 'newsletter'],
    required: [true, 'Template type is required']
  },
  
  // Template content
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true
  },
  htmlContent: {
    type: String,
    required: [true, 'HTML content is required']
  },
  textContent: {
    type: String,
    required: [true, 'Text content is required']
  },
  
  // Template metadata
  previewImage: {
    type: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Tracking
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);

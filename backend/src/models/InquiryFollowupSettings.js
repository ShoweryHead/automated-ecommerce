const mongoose = require('mongoose');

const InquiryFollowupSettingsSchema = new mongoose.Schema({
  // Global settings
  enabled: {
    type: Boolean,
    default: true
  },
  
  // Auto-response settings
  autoResponse: {
    enabled: {
      type: Boolean,
      default: true
    },
    emailEnabled: {
      type: Boolean,
      default: true
    },
    whatsappEnabled: {
      type: Boolean,
      default: true
    },
    emailTemplate: {
      subject: {
        type: String,
        default: 'Thank you for your inquiry about {product_names}'
      },
      body: {
        type: String,
        default: 'Dear {customer_name},\n\nThank you for your inquiry about {product_names}. We have received your message and will get back to you shortly.\n\nIn the meantime, you can view more details about the products you inquired about by clicking the links below:\n\n{product_links}\n\nBest regards,\nThe Team'
      }
    },
    whatsappTemplate: {
      type: String,
      default: 'Thank you for your inquiry about {product_names}. We have received your message and will get back to you shortly. In the meantime, you can view more details about the products you inquired about here: {product_links}'
    },
    includeProductImages: {
      type: Boolean,
      default: true
    },
    delay: {
      type: Number,
      default: 0, // in minutes, 0 means immediate
      min: 0
    }
  },
  
  // Follow-up reminders for staff
  staffReminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    initialReminderDelay: {
      type: Number,
      default: 4, // in hours
      min: 0
    },
    reminderFrequency: {
      type: Number,
      default: 24, // in hours
      min: 1
    },
    maxReminders: {
      type: Number,
      default: 3,
      min: 1
    },
    recipients: [{
      type: String,
      trim: true
    }],
    reminderTemplate: {
      subject: {
        type: String,
        default: 'Reminder: Inquiry from {customer_name} needs attention'
      },
      body: {
        type: String,
        default: 'This is a reminder that an inquiry from {customer_name} about {product_names} received on {inquiry_date} needs your attention.\n\nInquiry details:\n{inquiry_details}\n\nPlease follow up with the customer as soon as possible.'
      }
    }
  },
  
  // Automated follow-up settings
  automatedFollowUp: {
    enabled: {
      type: Boolean,
      default: true
    },
    firstFollowUpDelay: {
      type: Number,
      default: 48, // in hours
      min: 1
    },
    secondFollowUpDelay: {
      type: Number,
      default: 120, // in hours
      min: 1
    },
    maxAutomatedFollowUps: {
      type: Number,
      default: 2,
      min: 0,
      max: 5
    },
    emailEnabled: {
      type: Boolean,
      default: true
    },
    whatsappEnabled: {
      type: Boolean,
      default: false
    },
    firstFollowUpTemplate: {
      subject: {
        type: String,
        default: 'Following up on your inquiry about {product_names}'
      },
      body: {
        type: String,
        default: 'Dear {customer_name},\n\nWe hope this email finds you well. We wanted to follow up on your recent inquiry about {product_names}.\n\nAre you still interested in these products? We would be happy to provide you with more information or answer any questions you might have.\n\n{product_details}\n\nFeel free to reply to this email or contact us via WhatsApp for a quicker response.\n\nBest regards,\nThe Team'
      }
    },
    secondFollowUpTemplate: {
      subject: {
        type: String,
        default: 'Still interested in {product_names}?'
      },
      body: {
        type: String,
        default: 'Dear {customer_name},\n\nWe noticed you inquired about {product_names} a while ago, and we wanted to check if you are still interested or if your requirements have changed.\n\nWe would be happy to discuss your specific needs and provide a customized solution.\n\n{product_details}\n\nFeel free to reply to this email or contact us via WhatsApp for a quicker response.\n\nBest regards,\nThe Team'
      }
    }
  },
  
  // Quote follow-up settings
  quoteFollowUp: {
    enabled: {
      type: Boolean,
      default: true
    },
    followUpDelay: {
      type: Number,
      default: 72, // in hours
      min: 1
    },
    reminderFrequency: {
      type: Number,
      default: 120, // in hours
      min: 1
    },
    maxFollowUps: {
      type: Number,
      default: 2,
      min: 0,
      max: 5
    },
    template: {
      subject: {
        type: String,
        default: 'Following up on our quote for {product_names}'
      },
      body: {
        type: String,
        default: 'Dear {customer_name},\n\nWe hope this email finds you well. We wanted to follow up on the quote we sent you for {product_names}.\n\nHave you had a chance to review it? We would be happy to address any questions or concerns you might have.\n\nFeel free to reply to this email or contact us via WhatsApp for a quicker response.\n\nBest regards,\nThe Team'
      }
    }
  },
  
  // WhatsApp integration settings
  whatsappIntegration: {
    enabled: {
      type: Boolean,
      default: true
    },
    apiEndpoint: {
      type: String,
      trim: true
    },
    apiKey: {
      type: String,
      trim: true,
      select: false
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    includeWhatsappLink: {
      type: Boolean,
      default: true
    },
    whatsappLinkText: {
      type: String,
      default: 'Click here to contact us on WhatsApp'
    }
  },
  
  // Email integration settings
  emailIntegration: {
    smtpServer: {
      type: String,
      trim: true
    },
    smtpPort: {
      type: Number
    },
    username: {
      type: String,
      trim: true
    },
    password: {
      type: String,
      trim: true,
      select: false
    },
    fromEmail: {
      type: String,
      trim: true
    },
    fromName: {
      type: String,
      trim: true
    },
    replyToEmail: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InquiryFollowupSettings', InquiryFollowupSettingsSchema);

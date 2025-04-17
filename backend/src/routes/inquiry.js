const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const InquiryFollowup = require('../models/InquiryFollowup');
const InquiryFollowupSettings = require('../models/InquiryFollowupSettings');
const Product = require('../models/Product');
const { check, validationResult } = require('express-validator');

// Get all inquiries
router.get('/', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get inquiry by ID
router.get('/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate('products.product');
    
    if (!inquiry) {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    
    res.json(inquiry);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Create a new inquiry
router.post('/', [
  check('customer.name', 'Name is required').not().isEmpty(),
  check('customer.email', 'Please include a valid email').isEmail(),
  check('message', 'Message is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Create new inquiry
    const newInquiry = new Inquiry({
      customer: req.body.customer,
      subject: req.body.subject,
      message: req.body.message,
      products: req.body.products || [],
      source: req.body.source || 'website',
      tags: req.body.tags || []
    });
    
    // Save inquiry
    const inquiry = await newInquiry.save();
    
    // Get follow-up settings
    let settings = await InquiryFollowupSettings.findOne();
    if (!settings) {
      settings = new InquiryFollowupSettings();
      await settings.save();
    }
    
    // Schedule auto-response if enabled
    if (settings.enabled && settings.autoResponse.enabled) {
      // Create auto-response follow-up
      const autoResponseTime = new Date();
      if (settings.autoResponse.delay > 0) {
        autoResponseTime.setMinutes(autoResponseTime.getMinutes() + settings.autoResponse.delay);
      }
      
      // Prepare product information for templates
      let productNames = '';
      let productLinks = '';
      let productDetails = '';
      
      if (inquiry.products && inquiry.products.length > 0) {
        // Populate product information
        await Inquiry.populate(inquiry, { path: 'products.product' });
        
        // Create product names string
        productNames = inquiry.products.map(p => p.product.name).join(', ');
        
        // Create product links string
        productLinks = inquiry.products.map(p => 
          `<a href="${process.env.FRONTEND_URL}/product/${p.product.slug}">${p.product.name}</a>`
        ).join('<br>');
        
        // Create product details string
        productDetails = inquiry.products.map(p => 
          `<div style="margin-bottom: 15px;">
            <strong>${p.product.name}</strong>
            <p>${p.product.shortDescription}</p>
            <p>Quantity: ${p.quantity || 1}</p>
            ${p.notes ? `<p>Notes: ${p.notes}</p>` : ''}
          </div>`
        ).join('');
      }
      
      // Create email auto-response
      if (settings.autoResponse.emailEnabled) {
        // Replace template variables
        let emailSubject = settings.autoResponse.emailTemplate.subject
          .replace('{product_names}', productNames || 'our products')
          .replace('{customer_name}', inquiry.customer.name);
        
        let emailBody = settings.autoResponse.emailTemplate.body
          .replace('{product_names}', productNames || 'our products')
          .replace('{customer_name}', inquiry.customer.name)
          .replace('{product_links}', productLinks || 'our website')
          .replace('{product_details}', productDetails || '');
        
        const emailFollowup = new InquiryFollowup({
          inquiry: inquiry._id,
          status: 'pending',
          type: 'auto_response',
          channel: 'email',
          scheduledTime: autoResponseTime,
          content: {
            subject: emailSubject,
            body: emailBody,
            includedProducts: inquiry.products.map(p => p.product._id)
          },
          recipient: {
            name: inquiry.customer.name,
            email: inquiry.customer.email,
            phone: inquiry.customer.phone
          },
          metadata: {
            templateUsed: 'auto_response_email'
          }
        });
        
        await emailFollowup.save();
      }
      
      // Create WhatsApp auto-response
      if (settings.autoResponse.whatsappEnabled && inquiry.customer.phone) {
        // Replace template variables
        let whatsappMessage = settings.autoResponse.whatsappTemplate
          .replace('{product_names}', productNames || 'our products')
          .replace('{customer_name}', inquiry.customer.name)
          .replace('{product_links}', productLinks || 'our website');
        
        const whatsappFollowup = new InquiryFollowup({
          inquiry: inquiry._id,
          status: 'pending',
          type: 'auto_response',
          channel: 'whatsapp',
          scheduledTime: autoResponseTime,
          content: {
            body: whatsappMessage,
            includedProducts: inquiry.products.map(p => p.product._id)
          },
          recipient: {
            name: inquiry.customer.name,
            email: inquiry.customer.email,
            phone: inquiry.customer.phone
          },
          metadata: {
            templateUsed: 'auto_response_whatsapp'
          }
        });
        
        await whatsappFollowup.save();
      }
      
      // Schedule staff reminder if enabled
      if (settings.staffReminders.enabled) {
        const reminderTime = new Date();
        reminderTime.setHours(reminderTime.getHours() + settings.staffReminders.initialReminderDelay);
        
        // Replace template variables
        let reminderSubject = settings.staffReminders.reminderTemplate.subject
          .replace('{product_names}', productNames || 'our products')
          .replace('{customer_name}', inquiry.customer.name);
        
        let reminderBody = settings.staffReminders.reminderTemplate.body
          .replace('{product_names}', productNames || 'our products')
          .replace('{customer_name}', inquiry.customer.name)
          .replace('{inquiry_date}', inquiry.createdAt.toLocaleString())
          .replace('{inquiry_details}', inquiry.message);
        
        // Create reminder for each recipient
        for (const recipient of settings.staffReminders.recipients) {
          const staffReminder = new InquiryFollowup({
            inquiry: inquiry._id,
            status: 'pending',
            type: 'reminder',
            channel: 'email',
            scheduledTime: reminderTime,
            content: {
              subject: reminderSubject,
              body: reminderBody,
              includedProducts: inquiry.products.map(p => p.product._id)
            },
            recipient: {
              name: 'Staff',
              email: recipient
            },
            metadata: {
              templateUsed: 'staff_reminder'
            }
          });
          
          await staffReminder.save();
        }
      }
      
      // Schedule automated follow-up if enabled
      if (settings.automatedFollowUp.enabled) {
        const followUpTime = new Date();
        followUpTime.setHours(followUpTime.getHours() + settings.automatedFollowUp.firstFollowUpDelay);
        
        // Replace template variables
        let followUpSubject = settings.automatedFollowUp.firstFollowUpTemplate.subject
          .replace('{product_names}', productNames || 'our products')
          .replace('{customer_name}', inquiry.customer.name);
        
        let followUpBody = settings.automatedFollowUp.firstFollowUpTemplate.body
          .replace('{product_names}', productNames || 'our products')
          .replace('{customer_name}', inquiry.customer.name)
          .replace('{product_details}', productDetails || '');
        
        if (settings.automatedFollowUp.emailEnabled) {
          const emailFollowUp = new InquiryFollowup({
            inquiry: inquiry._id,
            status: 'pending',
            type: 'quote_followup',
            channel: 'email',
            scheduledTime: followUpTime,
            content: {
              subject: followUpSubject,
              body: followUpBody,
              includedProducts: inquiry.products.map(p => p.product._id)
            },
            recipient: {
              name: inquiry.customer.name,
              email: inquiry.customer.email,
              phone: inquiry.customer.phone
            },
            metadata: {
              templateUsed: 'first_followup_email'
            }
          });
          
          await emailFollowUp.save();
        }
        
        if (settings.automatedFollowUp.whatsappEnabled && inquiry.customer.phone) {
          // Create simplified message for WhatsApp
          let whatsappMessage = `Hello ${inquiry.customer.name}, we wanted to follow up on your inquiry about ${productNames || 'our products'}. Are you still interested? We'd be happy to provide more information.`;
          
          const whatsappFollowUp = new InquiryFollowup({
            inquiry: inquiry._id,
            status: 'pending',
            type: 'quote_followup',
            channel: 'whatsapp',
            scheduledTime: followUpTime,
            content: {
              body: whatsappMessage,
              includedProducts: inquiry.products.map(p => p.product._id)
            },
            recipient: {
              name: inquiry.customer.name,
              email: inquiry.customer.email,
              phone: inquiry.customer.phone
            },
            metadata: {
              templateUsed: 'first_followup_whatsapp'
            }
          });
          
          await whatsappFollowUp.save();
        }
      }
      
      // Update inquiry with automation tracking
      inquiry.automation.autoResponseSent = true;
      inquiry.automation.autoResponseTime = new Date();
      inquiry.automation.followUpScheduled = true;
      inquiry.automation.lastAutomatedAction = new Date();
      await inquiry.save();
    }
    
    res.json(inquiry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update inquiry status
router.put('/:id/status', async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    
    // Update status
    inquiry.status = req.body.status;
    
    // If status is changed to 'quoted', schedule quote follow-up
    if (req.body.status === 'quoted') {
      // Get follow-up settings
      let settings = await InquiryFollowupSettings.findOne();
      if (!settings) {
        settings = new InquiryFollowupSettings();
        await settings.save();
      }
      
      // Schedule quote follow-up if enabled
      if (settings.enabled && settings.quoteFollowUp.enabled) {
        const followUpTime = new Date();
        followUpTime.setHours(followUpTime.getHours() + settings.quoteFollowUp.followUpDelay);
        
        // Populate product information
        await Inquiry.populate(inquiry, { path: 'products.product' });
        
        // Prepare product information for templates
        let productNames = '';
        if (inquiry.products && inquiry.products.length > 0) {
          productNames = inquiry.products.map(p => p.product.name).join(', ');
        }
        
        // Replace template variables
        let followUpSubject = settings.quoteFollowUp.template.subject
          .replace('{product_names}', productNames || 'our products')
          .replace('{customer_name}', inquiry.customer.name);
        
        let followUpBody = settings.quoteFollowUp.template.body
          .replace('{product_names}', productNames || 'our products')
          .replace('{customer_name}', inquiry.customer.name);
        
        const quoteFollowUp = new InquiryFollowup({
          inquiry: inquiry._id,
          status: 'pending',
          type: 'quote_followup',
          channel: 'email',
          scheduledTime: followUpTime,
          content: {
            subject: followUpSubject,
            body: followUpBody,
            includedProducts: inquiry.products.map(p => p.product._id)
          },
          recipient: {
            name: inquiry.customer.name,
            email: inquiry.customer.email,
            phone: inquiry.customer.phone
          },
          metadata: {
            templateUsed: 'quote_followup'
          }
        });
        
        await quoteFollowUp.save();
        
        // Update inquiry with automation tracking
        inquiry.automation.followUpScheduled = true;
        inquiry.automation.lastAutomatedAction = new Date();
      }
    }
    
    await inquiry.save();
    res.json(inquiry);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Add communication to inquiry
router.post('/:id/communication', [
  check('type', 'Communication type is required').not().isEmpty(),
  check('direction', 'Communication direction is required').not().isEmpty(),
  check('content', 'Content is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    
    // Create new communication
    const newCommunication = {
      date: new Date(),
      type: req.body.type,
      direction: req.body.direction,
      content: req.body.content,
      attachments: req.body.attachments || [],
      performedBy: req.body.performedBy || 'system'
    };
    
    // Add to communications array
    inquiry.communications.unshift(newCommunication);
    
    // Update follow-up tracking
    inquiry.followUp.lastFollowUp = new Date();
    if (req.body.nextFollowUp) {
      inquiry.followUp.nextFollowUp = new Date(req.body.nextFollowUp);
    }
    inquiry.followUp.followUpCount += 1;
    if (req.body.followUpNotes) {
      inquiry.followUp.notes = req.body.followUpNotes;
    }
    
    await inquiry.save();
    res.json(inquiry);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Inquiry not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Get all follow-ups for an inquiry
router.get('/:id/followups', async (req, res) => {
  try {
    const followups = await InquiryFollowup.find({ inquiry: req.params.id }).sort({ scheduledTime: 1 });
    res.json(followups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get follow-up settings
router.get('/followup/settings', async (req, res) => {
  try {
    let settings = await InquiryFollowupSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new InquiryFollowupSettings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update follow-up settings
router.put('/followup/settings', async (req, res) => {
  try {
    let settings = await InquiryFollowupSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new InquiryFollowupSettings();
    }
    
    // Update fields from request body
    const updateFields = [
      'enabled', 'autoResponse', 'staffReminders', 'automatedFollowUp',
      'quoteFollowUp', 'whatsappIntegration', 'emailIntegration'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    
    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Process pending follow-ups (for cron job)
router.post('/followup/process', async (req, res) => {
  try {
    const now = new Date();
    
    // Find all pending follow-ups scheduled for now or earlier
    const pendingFollowups = await InquiryFollowup.find({
      status: 'pending',
      scheduledTime: { $lte: now }
    }).populate('inquiry');
    
    const results = {
      processed: 0,
      failed: 0,
      details: []
    };
    
    // Process each follow-up
    for (const followup of pendingFollowups) {
      try {
        // Here you would implement the actual sending logic
        // For email, WhatsApp, etc. based on the channel
        
        // For demonstration, we'll just mark it as sent
        followup.status = 'sent';
        followup.sentTime = new Date();
        await followup.save();
        
        // Update inquiry automation tracking
        if (followup.inquiry) {
          if (followup.type === 'auto_response') {
            followup.inquiry.automation.autoResponseSent = true;
            followup.inquiry.automation.autoResponseTime = new Date();
          } else if (followup.type === 'quote_followup') {
            followup.inquiry.automation.followUpEmailsSent += 1;
          }
          
          followup.inquiry.automation.lastAutomatedAction = new Date();
          await followup.inquiry.save();
        }
        
        results.processed += 1;
        results.details.push({
          id: followup._id,
          type: followup.type,
          channel: followup.channel,
          status: 'sent'
        });
      } catch (error) {
        followup.status = 'failed';
        await followup.save();
        
        results.failed += 1;
        results.details.push({
          id: followup._id,
          type: followup.type,
          channel: followup.channel,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

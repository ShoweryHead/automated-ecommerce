const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const MailchimpService = require('../services/MailchimpService');
const EmailTemplate = require('../models/EmailTemplate');
const EmailCampaign = require('../models/EmailCampaign');
const EmailSubscriber = require('../models/EmailSubscriber');

/**
 * @route   GET /api/email/templates
 * @desc    Get all email templates
 * @access  Private/Admin
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ type: 1, createdAt: -1 });
    res.json(templates);
  } catch (error) {
    console.error('Error getting email templates:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/email/templates/:id
 * @desc    Get a specific email template
 * @access  Private/Admin
 */
router.get('/templates/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error getting email template:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/email/templates
 * @desc    Create a new email template
 * @access  Private/Admin
 */
router.post(
  '/templates',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('type', 'Type is required').isIn(['welcome', 'product_announcement', 'inquiry_followup', 'promotional', 'newsletter']),
    check('subject', 'Subject is required').not().isEmpty(),
    check('htmlContent', 'HTML content is required').not().isEmpty(),
    check('textContent', 'Text content is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { name, description, type, subject, htmlContent, textContent, previewImage, isDefault } = req.body;
      
      // If this is set as default, unset any existing default for this type
      if (isDefault) {
        await EmailTemplate.updateMany(
          { type, isDefault: true },
          { isDefault: false }
        );
      }
      
      const template = await EmailTemplate.create({
        name,
        description,
        type,
        subject,
        htmlContent,
        textContent,
        previewImage,
        isDefault: isDefault || false,
        createdBy: req.user ? req.user.id : null
      });
      
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating email template:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   PUT /api/email/templates/:id
 * @desc    Update an email template
 * @access  Private/Admin
 */
router.put(
  '/templates/:id',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('subject', 'Subject is required').not().isEmpty(),
    check('htmlContent', 'HTML content is required').not().isEmpty(),
    check('textContent', 'Text content is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { name, description, subject, htmlContent, textContent, previewImage, isDefault } = req.body;
      
      const template = await EmailTemplate.findById(req.params.id);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      // If this is set as default, unset any existing default for this type
      if (isDefault && !template.isDefault) {
        await EmailTemplate.updateMany(
          { type: template.type, isDefault: true },
          { isDefault: false }
        );
      }
      
      template.name = name;
      template.description = description;
      template.subject = subject;
      template.htmlContent = htmlContent;
      template.textContent = textContent;
      template.previewImage = previewImage;
      template.isDefault = isDefault || false;
      template.updatedBy = req.user ? req.user.id : null;
      
      await template.save();
      
      res.json(template);
    } catch (error) {
      console.error('Error updating email template:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   DELETE /api/email/templates/:id
 * @desc    Delete an email template
 * @access  Private/Admin
 */
router.delete('/templates/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Check if template is in use by any campaigns
    const campaignsUsingTemplate = await EmailCampaign.countDocuments({ template: template._id });
    
    if (campaignsUsingTemplate > 0) {
      return res.status(400).json({ message: 'Cannot delete template that is in use by campaigns' });
    }
    
    await template.remove();
    
    res.json({ message: 'Template removed' });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/email/campaigns
 * @desc    Get all email campaigns
 * @access  Private/Admin
 */
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await EmailCampaign.find()
      .populate('template', 'name type')
      .sort({ createdAt: -1 });
    
    res.json(campaigns);
  } catch (error) {
    console.error('Error getting email campaigns:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/email/campaigns/:id
 * @desc    Get a specific email campaign
 * @access  Private/Admin
 */
router.get('/campaigns/:id', async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id)
      .populate('template');
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    console.error('Error getting email campaign:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/email/campaigns
 * @desc    Create a new email campaign
 * @access  Private/Admin
 */
router.post(
  '/campaigns',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('type', 'Type is required').isIn(['welcome', 'product_announcement', 'inquiry_followup', 'promotional', 'newsletter']),
    check('template', 'Template is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { 
        name, description, type, template, segment, 
        scheduledFor, recurring, status 
      } = req.body;
      
      // Verify template exists
      const templateExists = await EmailTemplate.findById(template);
      if (!templateExists) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      const campaign = await EmailCampaign.create({
        name,
        description,
        type,
        template,
        segment: segment || {},
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        recurring: recurring || { enabled: false },
        status: status || 'draft',
        createdBy: req.user ? req.user.id : null
      });
      
      res.status(201).json(campaign);
    } catch (error) {
      console.error('Error creating email campaign:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   PUT /api/email/campaigns/:id
 * @desc    Update an email campaign
 * @access  Private/Admin
 */
router.put(
  '/campaigns/:id',
  [
    check('name', 'Name is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { 
        name, description, template, segment, 
        scheduledFor, recurring, status 
      } = req.body;
      
      const campaign = await EmailCampaign.findById(req.params.id);
      
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      
      // Don't allow updating sent campaigns
      if (campaign.status === 'sent') {
        return res.status(400).json({ message: 'Cannot update a sent campaign' });
      }
      
      // If template is being changed, verify it exists
      if (template && template !== campaign.template.toString()) {
        const templateExists = await EmailTemplate.findById(template);
        if (!templateExists) {
          return res.status(404).json({ message: 'Template not found' });
        }
        campaign.template = template;
      }
      
      campaign.name = name;
      campaign.description = description;
      if (segment) campaign.segment = segment;
      if (scheduledFor) campaign.scheduledFor = new Date(scheduledFor);
      if (recurring) campaign.recurring = recurring;
      if (status) campaign.status = status;
      campaign.updatedBy = req.user ? req.user.id : null;
      
      await campaign.save();
      
      res.json(campaign);
    } catch (error) {
      console.error('Error updating email campaign:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   DELETE /api/email/campaigns/:id
 * @desc    Delete an email campaign
 * @access  Private/Admin
 */
router.delete('/campaigns/:id', async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Don't allow deleting sent campaigns
    if (campaign.status === 'sent') {
      return res.status(400).json({ message: 'Cannot delete a sent campaign' });
    }
    
    await campaign.remove();
    
    res.json({ message: 'Campaign removed' });
  } catch (error) {
    console.error('Error deleting email campaign:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/email/campaigns/:id/schedule
 * @desc    Schedule an email campaign
 * @access  Private/Admin
 */
router.post('/campaigns/:id/schedule', async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Don't allow scheduling already sent campaigns
    if (campaign.status === 'sent') {
      return res.status(400).json({ message: 'Cannot schedule a sent campaign' });
    }
    
    // Create campaign in Mailchimp
    const createResult = await MailchimpService.createCampaign(campaign);
    if (!createResult.success) {
      return res.status(500).json({ message: createResult.message });
    }
    
    // Schedule campaign
    const scheduleResult = await MailchimpService.scheduleCampaign(
      createResult.data.id,
      campaign.scheduledFor || new Date(Date.now() + 3600000) // Default: 1 hour from now
    );
    
    if (!scheduleResult.success) {
      return res.status(500).json({ message: scheduleResult.message });
    }
    
    // Update campaign status
    campaign.status = 'scheduled';
    campaign.mailchimpCampaignId = createResult.data.id;
    await campaign.save();
    
    res.json({ message: 'Campaign scheduled', campaign });
  } catch (error) {
    console.error('Error scheduling email campaign:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/email/campaigns/:id/send
 * @desc    Send an email campaign immediately
 * @access  Private/Admin
 */
router.post('/campaigns/:id/send', async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Don't allow sending already sent campaigns
    if (campaign.status === 'sent') {
      return res.status(400).json({ message: 'Campaign has already been sent' });
    }
    
    // If campaign is not in Mailchimp yet, create it
    if (!campaign.mailchimpCampaignId) {
      const createResult = await MailchimpService.createCampaign(campaign);
      if (!createResult.success) {
        return res.status(500).json({ message: createResult.message });
      }
      
      campaign.mailchimpCampaignId = createResult.data.id;
      await campaign.save();
    }
    
    // Send campaign
    const sendResult = await MailchimpService.sendCampaign(campaign.mailchimpCampaignId);
    
    if (!sendResult.success) {
      return res.status(500).json({ message: sendResult.message });
    }
    
    // Update campaign status
    campaign.status = 'sent';
    await campaign.save();
    
    res.json({ message: 'Campaign sent', campaign });
  } catch (error) {
    console.error('Error sending email campaign:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/email/campaigns/:id/stats
 * @desc    Get campaign statistics
 * @access  Private/Admin
 */
router.get('/campaigns/:id/stats', async (req, res) => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // If campaign has not been sent, return empty stats
    if (campaign.status !== 'sent' || !campaign.mailchimpCampaignId) {
      return res.json({ message: 'Campaign has not been sent yet', stats: campaign.stats });
    }
    
    // Update campaign stats from Mailchimp
    const statsResult = await MailchimpService.updateCampaignStats(campaign._id);
    
    if (!statsResult.success) {
      return res.status(500).json({ message: statsResult.message });
    }
    
    res.json({ message: 'Campaign statistics retrieved', stats: statsResult.stats });
  } catch (error) {
    console.error('Error getting campaign statistics:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/email/subscribers
 * @desc    Get all email subscribers
 * @access  Private/Admin
 */
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await EmailSubscriber.find()
      .sort({ createdAt: -1 });
    
    res.json(subscribers);
  } catch (error) {
    console.error('Error getting email subscribers:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/email/subscribers/:id
 * @desc    Get a specific email subscriber
 * @access  Private/Admin
 */
router.get('/subscribers/:id', async (req, res) => {
  try {
    const subscriber = await EmailSubscriber.findById(req.params.id);
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }
    
    res.json(subscriber);
  } catch (error) {
    console.error('Error getting email subscriber:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/email/subscribers
 * @desc    Create a new email subscriber
 * @access  Private/Admin
 */
router.post(
  '/subscribers',
  [
    check('email', 'Valid email is required').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { 
        email, firstName, lastName, company, phone,
        status, customerStatus, interests, region, source
      } = req.body;
      
      // Check if subscriber already exists
      const existingSubscriber = await EmailSubscriber.findOne({ email });
      
      if (existingSubscriber) {
        return res.status(400).json({ message: 'Subscriber already exists' });
      }
      
      // Create subscriber
      const subscriber = await EmailSubscriber.create({
        email,
        firstName,
        lastName,
        company,
        phone,
        status: status || 'subscribed',
        customerStatus: customerStatus || 'new',
        interests: interests || [],
        region,
        source: source || 'manual',
        consentGiven: true,
        consentTimestamp: new Date()
      });
      
      // Sync subscriber to Mailchimp
      await MailchimpService.syncSubscriber(subscriber);
      
      res.status(201).json(subscriber);
    } catch (error) {
      console.error('Error creating email subscriber:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   PUT /api/email/subscribers/:id
 * @desc    Update an email subscriber
 * @access  Private/Admin
 */
router.put(
  '/subscribers/:id',
  [
    check('email', 'Valid email is required').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { 
        email, firstName, lastName, company, phone,
        status, customerStatus, interests, region, engagementLevel
      } = req.body;
      
      const subscriber = await EmailSubscriber.findById(req.params.id);
      
      if (!subscriber) {
        return res.status(404).json({ message: 'Subscriber not found' });
      }
      
      // Check if email is being changed and if it already exists
      if (email !== subscriber.email) {
        const existingSubscriber = await EmailSubscriber.findOne({ email });
        
        if (existingSubscriber) {
          return res.status(400).json({ message: 'Email already in use by another subscriber' });
        }
        
        subscriber.email = email;
      }
      
      subscriber.firstName = firstName;
      subscriber.lastName = lastName;
      subscriber.company = company;
      subscriber.phone = phone;
      if (status) subscriber.status = status;
      if (customerStatus) subscriber.customerStatus = customerStatus;
      if (interests) subscriber.interests = interests;
      if (region) subscriber.region = region;
      if (engagementLevel) subscriber.engagementLevel = engagementLevel;
      
      await subscriber.save();
      
      // Sync subscriber to Mailchimp
      await MailchimpService.syncSubscriber(subscriber);
      
      res.json(subscriber);
    } catch (error) {
      console.error('Error updating email subscriber:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   DELETE /api/email/subscribers/:id
 * @desc    Delete an email subscriber
 * @access  Private/Admin
 */
router.delete('/subscribers/:id', async (req, res) => {
  try {
    const subscriber = await EmailSubscriber.findById(req.params.id);
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }
    
    await subscriber.remove();
    
    res.json({ message: 'Subscriber removed' });
  } catch (error) {
    console.error('Error deleting email subscriber:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/email/subscribers/import
 * @desc    Import subscribers from CSV
 * @access  Private/Admin
 */
router.post('/subscribers/import', async (req, res) => {
  try {
    // This would be handled by a file upload middleware
    // For now, we'll assume the data is in the request body
    const { subscribers } = req.body;
    
    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      return res.status(400).json({ message: 'No subscribers provided' });
    }
    
    const results = {
      total: subscribers.length,
      imported: 0,
      skipped: 0,
      errors: []
    };
    
    for (const subscriberData of subscribers) {
      try {
        // Validate email
        if (!subscriberData.email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(subscriberData.email)) {
          results.errors.push(`Invalid email: ${subscriberData.email}`);
          results.skipped++;
          continue;
        }
        
        // Check if subscriber already exists
        const existingSubscriber = await EmailSubscriber.findOne({ email: subscriberData.email });
        
        if (existingSubscriber) {
          results.errors.push(`Subscriber already exists: ${subscriberData.email}`);
          results.skipped++;
          continue;
        }
        
        // Create subscriber
        const subscriber = await EmailSubscriber.create({
          email: subscriberData.email,
          firstName: subscriberData.firstName || '',
          lastName: subscriberData.lastName || '',
          company: subscriberData.company || '',
          phone: subscriberData.phone || '',
          status: 'subscribed',
          customerStatus: subscriberData.customerStatus || 'new',
          interests: subscriberData.interests || [],
          region: subscriberData.region || '',
          source: 'import',
          consentGiven: true,
          consentTimestamp: new Date()
        });
        
        // Sync subscriber to Mailchimp
        await MailchimpService.syncSubscriber(subscriber);
        
        results.imported++;
      } catch (error) {
        console.error(`Error importing subscriber ${subscriberData.email}:`, error);
        results.errors.push(`Error importing ${subscriberData.email}: ${error.message}`);
        results.skipped++;
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error importing subscribers:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/email/process-new-subscriber
 * @desc    Process a new subscriber (from website form)
 * @access  Public
 */
router.post(
  '/process-new-subscriber',
  [
    check('email', 'Valid email is required').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const subscriberData = {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company: req.body.company,
        phone: req.body.phone,
        interests: req.body.interests,
        source: 'website',
        ip: req.ip
      };
      
      const result = await MailchimpService.processNewSubscriber(subscriberData);
      
      if (!result.success) {
        return res.status(500).json({ message: result.message });
      }
      
      res.status(201).json({ message: 'Subscription successful' });
    } catch (error) {
      console.error('Error processing new subscriber:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   POST /api/email/process-inquiry
 * @desc    Process an inquiry (from inquiry form)
 * @access  Public
 */
router.post(
  '/process-inquiry',
  [
    check('email', 'Valid email is required').isEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const inquiryData = {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        company: req.body.company,
        phone: req.body.phone,
        productInterests: req.body.productInterests,
        message: req.body.message,
        ip: req.ip
      };
      
      const result = await MailchimpService.processInquiryFollowup(inquiryData);
      
      if (!result.success) {
        return res.status(500).json({ message: result.message });
      }
      
      res.status(201).json({ message: 'Inquiry processed successfully' });
    } catch (error) {
      console.error('Error processing inquiry:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   POST /api/email/process-new-product
 * @desc    Process a new product announcement
 * @access  Private/Admin
 */
router.post('/process-new-product', async (req, res) => {
  try {
    const productData = req.body;
    
    if (!productData || !productData.title) {
      return res.status(400).json({ message: 'Product data is required' });
    }
    
    const result = await MailchimpService.processNewProductAnnouncement(productData);
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.status(201).json({ message: 'Product announcement processed successfully', campaign: result.campaign });
  } catch (error) {
    console.error('Error processing new product announcement:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/email/schedule-newsletter
 * @desc    Schedule a newsletter campaign
 * @access  Private/Admin
 */
router.post('/schedule-newsletter', async (req, res) => {
  try {
    const options = req.body;
    
    if (!options || !options.name) {
      return res.status(400).json({ message: 'Newsletter options are required' });
    }
    
    const result = await MailchimpService.scheduleNewsletter(options);
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.status(201).json({ message: 'Newsletter scheduled successfully', campaign: result.campaign });
  } catch (error) {
    console.error('Error scheduling newsletter:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/email/schedule-promotional
 * @desc    Schedule a promotional campaign
 * @access  Private/Admin
 */
router.post('/schedule-promotional', async (req, res) => {
  try {
    const options = req.body;
    
    if (!options || !options.name) {
      return res.status(400).json({ message: 'Promotional campaign options are required' });
    }
    
    const result = await MailchimpService.schedulePromotionalCampaign(options);
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.status(201).json({ message: 'Promotional campaign scheduled successfully', campaign: result.campaign });
  } catch (error) {
    console.error('Error scheduling promotional campaign:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/email/process-recurring
 * @desc    Process recurring campaigns
 * @access  Private/Admin
 */
router.post('/process-recurring', async (req, res) => {
  try {
    const result = await MailchimpService.processRecurringCampaigns();
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.json({ message: 'Recurring campaigns processed successfully', results: result.results });
  } catch (error) {
    console.error('Error processing recurring campaigns:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/email/test-connection
 * @desc    Test Mailchimp connection
 * @access  Private/Admin
 */
router.get('/test-connection', async (req, res) => {
  try {
    const result = await MailchimpService.testConnection();
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    res.json({ message: 'Mailchimp connection successful', data: result.data });
  } catch (error) {
    console.error('Error testing Mailchimp connection:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const mailchimp = require('@mailchimp/mailchimp_marketing');
const config = require('../config/config');
const EmailTemplate = require('../models/EmailTemplate');
const EmailCampaign = require('../models/EmailCampaign');
const EmailSubscriber = require('../models/EmailSubscriber');

// Initialize Mailchimp client
mailchimp.setConfig({
  apiKey: config.MAILCHIMP_API_KEY,
  server: config.MAILCHIMP_SERVER_PREFIX // e.g., 'us1'
});

/**
 * Service for managing email marketing automation with Mailchimp
 */
class MailchimpService {
  /**
   * Initialize the Mailchimp service
   */
  constructor() {
    this.defaultListId = config.MAILCHIMP_DEFAULT_LIST_ID;
  }

  /**
   * Test the Mailchimp connection
   * @returns {Object} Mailchimp API response
   */
  async testConnection() {
    try {
      const response = await mailchimp.ping.get();
      console.log('Mailchimp connection successful:', response);
      return { success: true, message: 'Mailchimp connection successful', data: response };
    } catch (error) {
      console.error('Mailchimp connection failed:', error);
      return { success: false, message: 'Mailchimp connection failed', error };
    }
  }

  /**
   * Sync a subscriber to Mailchimp
   * @param {Object} subscriber - Subscriber object
   * @param {String} listId - Mailchimp list ID (optional)
   * @returns {Object} Mailchimp API response
   */
  async syncSubscriber(subscriber, listId = this.defaultListId) {
    try {
      console.log(`Syncing subscriber ${subscriber.email} to Mailchimp list ${listId}`);

      // Prepare subscriber data for Mailchimp
      const subscriberData = {
        email_address: subscriber.email,
        status: subscriber.status === 'pending' ? 'pending' : 'subscribed',
        merge_fields: {
          FNAME: subscriber.firstName || '',
          LNAME: subscriber.lastName || '',
          COMPANY: subscriber.company || '',
          PHONE: subscriber.phone || ''
        },
        tags: []
      };

      // Add tags based on subscriber data
      if (subscriber.customerStatus) {
        subscriberData.tags.push(subscriber.customerStatus);
      }

      if (subscriber.interests && subscriber.interests.length > 0) {
        subscriberData.tags = [...subscriberData.tags, ...subscriber.interests];
      }

      if (subscriber.region) {
        subscriberData.tags.push(`region:${subscriber.region}`);
      }

      if (subscriber.engagementLevel) {
        subscriberData.tags.push(`engagement:${subscriber.engagementLevel}`);
      }

      // Check if subscriber already exists in Mailchimp
      if (subscriber.mailchimpId) {
        // Update existing subscriber
        const response = await mailchimp.lists.updateListMember(
          listId,
          subscriber.mailchimpId,
          subscriberData
        );

        console.log(`Subscriber ${subscriber.email} updated in Mailchimp`);
        return { success: true, message: 'Subscriber updated in Mailchimp', data: response };
      } else {
        // Create new subscriber
        const response = await mailchimp.lists.addListMember(
          listId,
          subscriberData
        );

        // Update local subscriber with Mailchimp ID
        await EmailSubscriber.findByIdAndUpdate(subscriber._id, {
          mailchimpId: response.id,
          mailchimpListId: listId
        });

        console.log(`Subscriber ${subscriber.email} added to Mailchimp`);
        return { success: true, message: 'Subscriber added to Mailchimp', data: response };
      }
    } catch (error) {
      console.error(`Error syncing subscriber ${subscriber.email} to Mailchimp:`, error);
      return { success: false, message: 'Error syncing subscriber to Mailchimp', error };
    }
  }

  /**
   * Create a segment in Mailchimp
   * @param {String} name - Segment name
   * @param {Object} conditions - Segment conditions
   * @param {String} listId - Mailchimp list ID (optional)
   * @returns {Object} Mailchimp API response
   */
  async createSegment(name, conditions, listId = this.defaultListId) {
    try {
      console.log(`Creating segment "${name}" in Mailchimp list ${listId}`);

      const response = await mailchimp.lists.createSegment(listId, {
        name,
        static_segment: [],
        options: {
          match: 'all',
          conditions
        }
      });

      console.log(`Segment "${name}" created in Mailchimp`);
      return { success: true, message: 'Segment created in Mailchimp', data: response };
    } catch (error) {
      console.error(`Error creating segment "${name}" in Mailchimp:`, error);
      return { success: false, message: 'Error creating segment in Mailchimp', error };
    }
  }

  /**
   * Create a campaign in Mailchimp
   * @param {Object} campaign - Campaign object
   * @param {String} listId - Mailchimp list ID (optional)
   * @returns {Object} Mailchimp API response
   */
  async createCampaign(campaign, listId = this.defaultListId) {
    try {
      console.log(`Creating campaign "${campaign.name}" in Mailchimp`);

      // Get the email template
      const template = await EmailTemplate.findById(campaign.template);
      if (!template) {
        throw new Error(`Template not found with ID: ${campaign.template}`);
      }

      // Prepare segment options
      let segmentOpts = {};
      if (campaign.segment && Object.keys(campaign.segment).length > 0) {
        // Convert our segment format to Mailchimp's format
        // This is a simplified example - in a real implementation, 
        // you would need more complex logic to convert segment criteria
        const conditions = [];
        
        if (campaign.segment.customerStatus) {
          conditions.push({
            condition_type: 'Tag',
            op: 'is',
            field: 'tag',
            value: campaign.segment.customerStatus
          });
        }
        
        if (campaign.segment.interests && campaign.segment.interests.length > 0) {
          campaign.segment.interests.forEach(interest => {
            conditions.push({
              condition_type: 'Tag',
              op: 'is',
              field: 'tag',
              value: interest
            });
          });
        }
        
        if (campaign.segment.region) {
          conditions.push({
            condition_type: 'Tag',
            op: 'is',
            field: 'tag',
            value: `region:${campaign.segment.region}`
          });
        }
        
        if (campaign.segment.engagementLevel) {
          conditions.push({
            condition_type: 'Tag',
            op: 'is',
            field: 'tag',
            value: `engagement:${campaign.segment.engagementLevel}`
          });
        }
        
        segmentOpts = {
          match: 'all',
          conditions
        };
      }

      // Create campaign in Mailchimp
      const campaignResponse = await mailchimp.campaigns.create({
        type: 'regular',
        recipients: {
          list_id: listId,
          segment_opts: segmentOpts
        },
        settings: {
          subject_line: template.subject,
          title: campaign.name,
          from_name: config.MAILCHIMP_FROM_NAME,
          reply_to: config.MAILCHIMP_REPLY_TO,
          template_id: template.mailchimpTemplateId
        }
      });

      // Set campaign content
      await mailchimp.campaigns.setContent(campaignResponse.id, {
        html: template.htmlContent
      });

      // Update local campaign with Mailchimp ID
      await EmailCampaign.findByIdAndUpdate(campaign._id, {
        mailchimpCampaignId: campaignResponse.id,
        status: 'scheduled'
      });

      console.log(`Campaign "${campaign.name}" created in Mailchimp with ID: ${campaignResponse.id}`);
      return { success: true, message: 'Campaign created in Mailchimp', data: campaignResponse };
    } catch (error) {
      console.error(`Error creating campaign "${campaign.name}" in Mailchimp:`, error);
      return { success: false, message: 'Error creating campaign in Mailchimp', error };
    }
  }

  /**
   * Schedule a campaign in Mailchimp
   * @param {String} campaignId - Mailchimp campaign ID
   * @param {Date} scheduledTime - Scheduled time
   * @returns {Object} Mailchimp API response
   */
  async scheduleCampaign(campaignId, scheduledTime) {
    try {
      console.log(`Scheduling campaign ${campaignId} in Mailchimp for ${scheduledTime}`);

      // Format date for Mailchimp (ISO 8601)
      const formattedDate = scheduledTime.toISOString();

      const response = await mailchimp.campaigns.schedule(campaignId, {
        schedule_time: formattedDate
      });

      console.log(`Campaign ${campaignId} scheduled in Mailchimp for ${scheduledTime}`);
      return { success: true, message: 'Campaign scheduled in Mailchimp', data: response };
    } catch (error) {
      console.error(`Error scheduling campaign ${campaignId} in Mailchimp:`, error);
      return { success: false, message: 'Error scheduling campaign in Mailchimp', error };
    }
  }

  /**
   * Send a campaign immediately in Mailchimp
   * @param {String} campaignId - Mailchimp campaign ID
   * @returns {Object} Mailchimp API response
   */
  async sendCampaign(campaignId) {
    try {
      console.log(`Sending campaign ${campaignId} in Mailchimp`);

      const response = await mailchimp.campaigns.send(campaignId);

      console.log(`Campaign ${campaignId} sent in Mailchimp`);
      return { success: true, message: 'Campaign sent in Mailchimp', data: response };
    } catch (error) {
      console.error(`Error sending campaign ${campaignId} in Mailchimp:`, error);
      return { success: false, message: 'Error sending campaign in Mailchimp', error };
    }
  }

  /**
   * Get campaign report from Mailchimp
   * @param {String} campaignId - Mailchimp campaign ID
   * @returns {Object} Mailchimp API response
   */
  async getCampaignReport(campaignId) {
    try {
      console.log(`Getting report for campaign ${campaignId} from Mailchimp`);

      const response = await mailchimp.reports.getCampaignReport(campaignId);

      console.log(`Got report for campaign ${campaignId} from Mailchimp`);
      return { success: true, message: 'Campaign report retrieved from Mailchimp', data: response };
    } catch (error) {
      console.error(`Error getting report for campaign ${campaignId} from Mailchimp:`, error);
      return { success: false, message: 'Error getting campaign report from Mailchimp', error };
    }
  }

  /**
   * Create an automation workflow in Mailchimp
   * @param {String} name - Workflow name
   * @param {String} triggerSettings - Trigger settings
   * @param {String} listId - Mailchimp list ID (optional)
   * @returns {Object} Mailchimp API response
   */
  async createAutomation(name, triggerSettings, listId = this.defaultListId) {
    try {
      console.log(`Creating automation workflow "${name}" in Mailchimp`);

      const response = await mailchimp.automations.create({
        recipients: {
          list_id: listId
        },
        trigger_settings: triggerSettings,
        settings: {
          title: name,
          from_name: config.MAILCHIMP_FROM_NAME,
          reply_to: config.MAILCHIMP_REPLY_TO
        }
      });

      console.log(`Automation workflow "${name}" created in Mailchimp`);
      return { success: true, message: 'Automation workflow created in Mailchimp', data: response };
    } catch (error) {
      console.error(`Error creating automation workflow "${name}" in Mailchimp:`, error);
      return { success: false, message: 'Error creating automation workflow in Mailchimp', error };
    }
  }

  /**
   * Create a welcome email automation
   * @returns {Object} Mailchimp API response
   */
  async createWelcomeEmailAutomation() {
    try {
      console.log('Creating welcome email automation in Mailchimp');

      // Get the welcome email template
      const template = await EmailTemplate.findOne({ type: 'welcome', isDefault: true });
      if (!template) {
        throw new Error('Default welcome email template not found');
      }

      // Create automation workflow
      const automation = await this.createAutomation(
        'Welcome Email Automation',
        {
          workflow_type: 'welcomeSeries',
          workflow_emails_count: 1
        }
      );

      if (!automation.success) {
        throw new Error('Failed to create welcome email automation');
      }

      // Add email to automation workflow
      const automationId = automation.data.id;
      const response = await mailchimp.automations.addWorkflowEmail(automationId, {
        delay: {
          amount: 0,
          type: 'day'
        },
        subject_line: template.subject,
        title: 'Welcome Email',
        from_name: config.MAILCHIMP_FROM_NAME,
        reply_to: config.MAILCHIMP_REPLY_TO,
        content_type: 'html',
        content: template.htmlContent
      });

      console.log('Welcome email automation created in Mailchimp');
      return { success: true, message: 'Welcome email automation created in Mailchimp', data: response };
    } catch (error) {
      console.error('Error creating welcome email automation in Mailchimp:', error);
      return { success: false, message: 'Error creating welcome email automation in Mailchimp', error };
    }
  }

  /**
   * Create a product announcement automation
   * @returns {Object} Mailchimp API response
   */
  async createProductAnnouncementAutomation() {
    try {
      console.log('Creating product announcement automation in Mailchimp');

      // Get the product announcement template
      const template = await EmailTemplate.findOne({ type: 'product_announcement', isDefault: true });
      if (!template) {
        throw new Error('Default product announcement template not found');
      }

      // Create automation workflow
      const automation = await this.createAutomation(
        'Product Announcement Automation',
        {
          workflow_type: 'custom',
          workflow_emails_count: 1
        }
      );

      if (!automation.success) {
        throw new Error('Failed to create product announcement automation');
      }

      // Add email to automation workflow
      const automationId = automation.data.id;
      const response = await mailchimp.automations.addWorkflowEmail(automationId, {
        delay: {
          amount: 0,
          type: 'day'
        },
        subject_line: template.subject,
        title: 'New Product Announcement',
        from_name: config.MAILCHIMP_FROM_NAME,
        reply_to: config.MAILCHIMP_REPLY_TO,
        content_type: 'html',
        content: template.htmlContent
      });

      console.log('Product announcement automation created in Mailchimp');
      return { success: true, message: 'Product announcement automation created in Mailchimp', data: response };
    } catch (error) {
      console.error('Error creating product announcement automation in Mailchimp:', error);
      return { success: false, message: 'Error creating product announcement automation in Mailchimp', error };
    }
  }

  /**
   * Create an inquiry follow-up automation
   * @returns {Object} Mailchimp API response
   */
  async createInquiryFollowupAutomation() {
    try {
      console.log('Creating inquiry follow-up automation in Mailchimp');

      // Get the inquiry follow-up template
      const template = await EmailTemplate.findOne({ type: 'inquiry_followup', isDefault: true });
      if (!template) {
        throw new Error('Default inquiry follow-up template not found');
      }

      // Create automation workflow
      const automation = await this.createAutomation(
        'Inquiry Follow-up Automation',
        {
          workflow_type: 'custom',
          workflow_emails_count: 1
        }
      );

      if (!automation.success) {
        throw new Error('Failed to create inquiry follow-up automation');
      }

      // Add email to automation workflow
      const automationId = automation.data.id;
      const response = await mailchimp.automations.addWorkflowEmail(automationId, {
        delay: {
          amount: 1,
          type: 'day'
        },
        subject_line: template.subject,
        title: 'Inquiry Follow-up',
        from_name: config.MAILCHIMP_FROM_NAME,
        reply_to: config.MAILCHIMP_REPLY_TO,
        content_type: 'html',
        content: template.htmlContent
      });

      console.log('Inquiry follow-up automation created in Mailchimp');
      return { success: true, message: 'Inquiry follow-up automation created in Mailchimp', data: response };
    } catch (error) {
      console.error('Error creating inquiry follow-up automation in Mailchimp:', error);
      return { success: false, message: 'Error creating inquiry follow-up automation in Mailchimp', error };
    }
  }

  /**
   * Process a new subscriber
   * @param {Object} subscriber - Subscriber data
   * @returns {Object} Processing result
   */
  async processNewSubscriber(subscriber) {
    try {
      console.log(`Processing new subscriber: ${subscriber.email}`);

      // Create subscriber in database if not exists
      let subscriberDoc = await EmailSubscriber.findOne({ email: subscriber.email });
      
      if (!subscriberDoc) {
        subscriberDoc = await EmailSubscriber.create({
          email: subscriber.email,
          firstName: subscriber.firstName,
          lastName: subscriber.lastName,
          company: subscriber.company,
          phone: subscriber.phone,
          status: 'subscribed',
          customerStatus: subscriber.customerStatus || 'new',
          interests: subscriber.interests || [],
          region: subscriber.region,
          source: subscriber.source || 'website',
          consentGiven: true,
          consentTimestamp: new Date(),
          consentIP: subscriber.ip
        });
      }

      // Sync subscriber to Mailchimp
      const syncResult = await this.syncSubscriber(subscriberDoc);
      if (!syncResult.success) {
        throw new Error(`Failed to sync subscriber to Mailchimp: ${syncResult.message}`);
      }

      // Add activity record
      subscriberDoc.activityHistory.push({
        action: 'subscribed',
        timestamp: new Date(),
        details: `Subscribed via ${subscriber.source || 'website'}`
      });
      
      await subscriberDoc.save();

      console.log(`New subscriber processed: ${subscriber.email}`);
      return { success: true, message: 'New subscriber processed successfully', subscriber: subscriberDoc };
    } catch (error) {
      console.error(`Error processing new subscriber ${subscriber.email}:`, error);
      return { success: false, message: 'Error processing new subscriber', error };
    }
  }

  /**
   * Process a new product announcement
   * @param {Object} product - Product data
   * @returns {Object} Processing result
   */
  async processNewProductAnnouncement(product) {
    try {
      console.log(`Processing new product announcement for: ${product.title}`);

      // Get the product announcement template
      const template = await EmailTemplate.findOne({ type: 'product_announcement', isDefault: true });
      if (!template) {
        throw new Error('Default product announcement template not found');
      }

      // Create a campaign for the product announcement
      const campaign = await EmailCampaign.create({
        name: `New Product: ${product.title}`,
        description: `Announcement for new product: ${product.title}`,
        type: 'product_announcement',
        template: template._id,
        segment: {
          interests: [product.category ? product.category.name : 'all-products']
        },
        scheduledFor: new Date(Date.now() + 3600000), // Schedule for 1 hour from now
        status: 'draft'
      });

      // Create campaign in Mailchimp
      const createResult = await this.createCampaign(campaign);
      if (!createResult.success) {
        throw new Error(`Failed to create campaign in Mailchimp: ${createResult.message}`);
      }

      // Schedule campaign
      const scheduleResult = await this.scheduleCampaign(
        createResult.data.id,
        campaign.scheduledFor
      );
      
      if (!scheduleResult.success) {
        throw new Error(`Failed to schedule campaign in Mailchimp: ${scheduleResult.message}`);
      }

      console.log(`New product announcement processed for: ${product.title}`);
      return { success: true, message: 'New product announcement processed successfully', campaign };
    } catch (error) {
      console.error(`Error processing new product announcement for ${product.title}:`, error);
      return { success: false, message: 'Error processing new product announcement', error };
    }
  }

  /**
   * Process an inquiry follow-up
   * @param {Object} inquiry - Inquiry data
   * @returns {Object} Processing result
   */
  async processInquiryFollowup(inquiry) {
    try {
      console.log(`Processing inquiry follow-up for: ${inquiry.email}`);

      // Check if subscriber exists
      let subscriber = await EmailSubscriber.findOne({ email: inquiry.email });
      
      // If not, create a new subscriber
      if (!subscriber) {
        const subscriberData = {
          email: inquiry.email,
          firstName: inquiry.firstName,
          lastName: inquiry.lastName,
          company: inquiry.company,
          phone: inquiry.phone,
          source: 'inquiry',
          interests: inquiry.productInterests || [],
          ip: inquiry.ip
        };
        
        const processResult = await this.processNewSubscriber(subscriberData);
        if (!processResult.success) {
          throw new Error(`Failed to process new subscriber: ${processResult.message}`);
        }
        
        subscriber = processResult.subscriber;
      } else {
        // Update existing subscriber with new interests
        if (inquiry.productInterests && inquiry.productInterests.length > 0) {
          const newInterests = [...new Set([...subscriber.interests, ...inquiry.productInterests])];
          subscriber.interests = newInterests;
          await subscriber.save();
          
          // Sync updated subscriber to Mailchimp
          await this.syncSubscriber(subscriber);
        }
      }

      // Get the inquiry follow-up template
      const template = await EmailTemplate.findOne({ type: 'inquiry_followup', isDefault: true });
      if (!template) {
        throw new Error('Default inquiry follow-up template not found');
      }

      // Create a campaign for the inquiry follow-up
      const campaign = await EmailCampaign.create({
        name: `Inquiry Follow-up: ${inquiry.email}`,
        description: `Follow-up for inquiry from: ${inquiry.email}`,
        type: 'inquiry_followup',
        template: template._id,
        segment: {
          // Target only this specific subscriber
          email: [inquiry.email]
        },
        scheduledFor: new Date(Date.now() + 86400000), // Schedule for 24 hours from now
        status: 'draft'
      });

      // Create campaign in Mailchimp
      const createResult = await this.createCampaign(campaign);
      if (!createResult.success) {
        throw new Error(`Failed to create campaign in Mailchimp: ${createResult.message}`);
      }

      // Schedule campaign
      const scheduleResult = await this.scheduleCampaign(
        createResult.data.id,
        campaign.scheduledFor
      );
      
      if (!scheduleResult.success) {
        throw new Error(`Failed to schedule campaign in Mailchimp: ${scheduleResult.message}`);
      }

      console.log(`Inquiry follow-up processed for: ${inquiry.email}`);
      return { success: true, message: 'Inquiry follow-up processed successfully', campaign };
    } catch (error) {
      console.error(`Error processing inquiry follow-up for ${inquiry.email}:`, error);
      return { success: false, message: 'Error processing inquiry follow-up', error };
    }
  }

  /**
   * Schedule a newsletter campaign
   * @param {Object} options - Newsletter options
   * @returns {Object} Processing result
   */
  async scheduleNewsletter(options) {
    try {
      console.log('Scheduling newsletter campaign');

      // Get the newsletter template
      const template = await EmailTemplate.findOne({ type: 'newsletter', isDefault: true });
      if (!template) {
        throw new Error('Default newsletter template not found');
      }

      // Create a campaign for the newsletter
      const campaign = await EmailCampaign.create({
        name: options.name || `Newsletter: ${new Date().toLocaleDateString()}`,
        description: options.description || 'Regular newsletter campaign',
        type: 'newsletter',
        template: template._id,
        segment: options.segment || {},
        scheduledFor: options.scheduledFor || new Date(Date.now() + 3600000), // Default: 1 hour from now
        recurring: options.recurring || {
          enabled: false
        },
        status: 'draft'
      });

      // Create campaign in Mailchimp
      const createResult = await this.createCampaign(campaign);
      if (!createResult.success) {
        throw new Error(`Failed to create campaign in Mailchimp: ${createResult.message}`);
      }

      // Schedule campaign
      const scheduleResult = await this.scheduleCampaign(
        createResult.data.id,
        campaign.scheduledFor
      );
      
      if (!scheduleResult.success) {
        throw new Error(`Failed to schedule campaign in Mailchimp: ${scheduleResult.message}`);
      }

      console.log('Newsletter campaign scheduled');
      return { success: true, message: 'Newsletter campaign scheduled successfully', campaign };
    } catch (error) {
      console.error('Error scheduling newsletter campaign:', error);
      return { success: false, message: 'Error scheduling newsletter campaign', error };
    }
  }

  /**
   * Schedule a promotional campaign
   * @param {Object} options - Promotional campaign options
   * @returns {Object} Processing result
   */
  async schedulePromotionalCampaign(options) {
    try {
      console.log('Scheduling promotional campaign');

      // Get the promotional template
      const template = await EmailTemplate.findOne({ type: 'promotional', isDefault: true });
      if (!template) {
        throw new Error('Default promotional template not found');
      }

      // Create a campaign for the promotion
      const campaign = await EmailCampaign.create({
        name: options.name || `Promotion: ${new Date().toLocaleDateString()}`,
        description: options.description || 'Promotional campaign',
        type: 'promotional',
        template: template._id,
        segment: options.segment || {},
        scheduledFor: options.scheduledFor || new Date(Date.now() + 3600000), // Default: 1 hour from now
        status: 'draft'
      });

      // Create campaign in Mailchimp
      const createResult = await this.createCampaign(campaign);
      if (!createResult.success) {
        throw new Error(`Failed to create campaign in Mailchimp: ${createResult.message}`);
      }

      // Schedule campaign
      const scheduleResult = await this.scheduleCampaign(
        createResult.data.id,
        campaign.scheduledFor
      );
      
      if (!scheduleResult.success) {
        throw new Error(`Failed to schedule campaign in Mailchimp: ${scheduleResult.message}`);
      }

      console.log('Promotional campaign scheduled');
      return { success: true, message: 'Promotional campaign scheduled successfully', campaign };
    } catch (error) {
      console.error('Error scheduling promotional campaign:', error);
      return { success: false, message: 'Error scheduling promotional campaign', error };
    }
  }

  /**
   * Process recurring campaigns
   * @returns {Object} Processing result
   */
  async processRecurringCampaigns() {
    try {
      console.log('Processing recurring campaigns');

      // Find campaigns with recurring enabled
      const campaigns = await EmailCampaign.find({
        'recurring.enabled': true,
        status: { $in: ['draft', 'sent'] }
      });

      console.log(`Found ${campaigns.length} recurring campaigns to process`);

      const results = [];

      for (const campaign of campaigns) {
        try {
          // Check if it's time to schedule the next campaign
          const now = new Date();
          const nextScheduled = campaign.recurring.nextScheduled;
          
          if (!nextScheduled || nextScheduled <= now) {
            console.log(`Processing recurring campaign: ${campaign.name}`);
            
            // Calculate next scheduled date
            const nextDate = new Date();
            
            switch (campaign.recurring.frequency) {
              case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
              case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
              case 'biweekly':
                nextDate.setDate(nextDate.getDate() + 14);
                break;
              case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
              case 'quarterly':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
              default:
                nextDate.setMonth(nextDate.getMonth() + 1);
            }
            
            // Set day of week/month if specified
            if (campaign.recurring.dayOfWeek !== undefined && campaign.recurring.frequency !== 'daily') {
              // Find the next occurrence of the specified day of week
              while (nextDate.getDay() !== campaign.recurring.dayOfWeek) {
                nextDate.setDate(nextDate.getDate() + 1);
              }
            }
            
            if (campaign.recurring.dayOfMonth && ['monthly', 'quarterly'].includes(campaign.recurring.frequency)) {
              // Set to the specified day of month, handling month length
              const maxDay = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
              nextDate.setDate(Math.min(campaign.recurring.dayOfMonth, maxDay));
            }
            
            // Set time of day
            if (campaign.recurring.timeOfDay) {
              const [hours, minutes] = campaign.recurring.timeOfDay.split(':').map(Number);
              nextDate.setHours(hours, minutes, 0, 0);
            }
            
            // Create a new campaign based on the recurring one
            const newCampaign = await EmailCampaign.create({
              name: `${campaign.name} - ${nextDate.toLocaleDateString()}`,
              description: campaign.description,
              type: campaign.type,
              template: campaign.template,
              segment: campaign.segment,
              scheduledFor: nextDate,
              status: 'draft'
            });
            
            // Create campaign in Mailchimp
            const createResult = await this.createCampaign(newCampaign);
            if (!createResult.success) {
              throw new Error(`Failed to create campaign in Mailchimp: ${createResult.message}`);
            }
            
            // Schedule campaign
            const scheduleResult = await this.scheduleCampaign(
              createResult.data.id,
              newCampaign.scheduledFor
            );
            
            if (!scheduleResult.success) {
              throw new Error(`Failed to schedule campaign in Mailchimp: ${scheduleResult.message}`);
            }
            
            // Update the recurring campaign with the next scheduled date
            campaign.recurring.lastSent = now;
            campaign.recurring.nextScheduled = nextDate;
            await campaign.save();
            
            results.push({
              campaign: campaign.name,
              nextScheduled: nextDate,
              success: true
            });
          }
        } catch (error) {
          console.error(`Error processing recurring campaign ${campaign.name}:`, error);
          results.push({
            campaign: campaign.name,
            success: false,
            error: error.message
          });
        }
      }

      console.log('Recurring campaigns processed');
      return { success: true, message: 'Recurring campaigns processed', results };
    } catch (error) {
      console.error('Error processing recurring campaigns:', error);
      return { success: false, message: 'Error processing recurring campaigns', error };
    }
  }

  /**
   * Update campaign statistics from Mailchimp
   * @param {String} campaignId - Local campaign ID
   * @returns {Object} Processing result
   */
  async updateCampaignStats(campaignId) {
    try {
      console.log(`Updating statistics for campaign ${campaignId}`);

      // Get the campaign
      const campaign = await EmailCampaign.findById(campaignId);
      if (!campaign) {
        throw new Error(`Campaign not found with ID: ${campaignId}`);
      }

      if (!campaign.mailchimpCampaignId) {
        throw new Error(`Campaign ${campaignId} does not have a Mailchimp campaign ID`);
      }

      // Get campaign report from Mailchimp
      const reportResult = await this.getCampaignReport(campaign.mailchimpCampaignId);
      if (!reportResult.success) {
        throw new Error(`Failed to get campaign report from Mailchimp: ${reportResult.message}`);
      }

      const report = reportResult.data;

      // Update campaign statistics
      campaign.stats = {
        recipients: report.emails_sent || 0,
        opens: report.opens.unique_opens || 0,
        clicks: report.clicks.unique_clicks || 0,
        unsubscribes: report.unsubscribes || 0,
        bounces: report.bounces.hard_bounces + report.bounces.soft_bounces || 0
      };

      await campaign.save();

      console.log(`Statistics updated for campaign ${campaignId}`);
      return { success: true, message: 'Campaign statistics updated', stats: campaign.stats };
    } catch (error) {
      console.error(`Error updating statistics for campaign ${campaignId}:`, error);
      return { success: false, message: 'Error updating campaign statistics', error };
    }
  }
}

module.exports = new MailchimpService();

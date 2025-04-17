const Product = require('../models/Product');
const Category = require('../models/Category');
const ProductGenerationQueue = require('../models/ProductGenerationQueue');
const AutomationSettings = require('../models/AutomationSettings');
const ContentGenerationService = require('../services/ContentGenerationService');
const ImageGenerationService = require('../services/ImageGenerationService');

/**
 * Service for managing the product generation process
 */
class ProductGenerationService {
  /**
   * Queue a new product for generation
   * @param {Array} keywords - Keywords for product generation
   * @param {String} categoryId - ID of the category
   * @param {Object} options - Additional options
   * @returns {Object} Created queue item
   */
  async queueProductGeneration(keywords, categoryId, options = {}) {
    try {
      console.log(`Queueing product generation with keywords: ${keywords.join(', ')}`);
      
      // Create a new queue item
      const queueItem = await ProductGenerationQueue.create({
        keywords,
        category: categoryId,
        priority: options.priority || 1,
        scheduledFor: options.scheduledFor || new Date()
      });
      
      console.log(`Product generation queued with ID: ${queueItem._id}`);
      
      return queueItem;
    } catch (error) {
      console.error('Error queueing product generation:', error);
      throw new Error(`Failed to queue product generation: ${error.message}`);
    }
  }
  
  /**
   * Process the next item in the generation queue
   * @returns {Object} Processing result
   */
  async processNextQueueItem() {
    try {
      console.log('Processing next queue item');
      
      // Find the next item to process
      const queueItem = await ProductGenerationQueue.findOne({
        status: 'queued',
        $or: [
          { scheduledFor: { $lte: new Date() } },
          { scheduledFor: { $exists: false } }
        ]
      }).sort({ priority: -1, queuedAt: 1 }).populate('category');
      
      if (!queueItem) {
        console.log('No queue items to process');
        return { success: true, message: 'No queue items to process' };
      }
      
      console.log(`Processing queue item: ${queueItem._id}`);
      
      // Update status to processing
      queueItem.status = 'processing';
      queueItem.processingStartedAt = new Date();
      await queueItem.save();
      
      // Start processing timer
      const startTime = Date.now();
      
      try {
        // Generate the product
        const product = await this.generateProduct(queueItem.keywords, queueItem.category);
        
        // Update queue item with success
        queueItem.status = 'completed';
        queueItem.completedAt = new Date();
        queueItem.result = {
          productId: product._id,
          processingTime: Date.now() - startTime
        };
        await queueItem.save();
        
        console.log(`Queue item ${queueItem._id} processed successfully`);
        
        return {
          success: true,
          queueItem,
          product
        };
      } catch (error) {
        // Update queue item with error
        queueItem.status = 'failed';
        queueItem.completedAt = new Date();
        queueItem.result = {
          error: error.message,
          processingTime: Date.now() - startTime
        };
        await queueItem.save();
        
        console.error(`Error processing queue item ${queueItem._id}:`, error);
        
        return {
          success: false,
          queueItem,
          error: error.message
        };
      }
    } catch (error) {
      console.error('Error in processNextQueueItem:', error);
      throw new Error(`Failed to process queue item: ${error.message}`);
    }
  }
  
  /**
   * Generate a product based on keywords and category
   * @param {Array} keywords - Keywords for product generation
   * @param {Object} category - Category object
   * @returns {Object} Generated product
   */
  async generateProduct(keywords, category) {
    try {
      console.log(`Generating product with keywords: ${keywords.join(', ')}`);
      
      // Get automation settings
      const settings = await AutomationSettings.getSettings();
      
      // Generate product content
      const content = await ContentGenerationService.generateProductContent(
        keywords,
        category.name
      );
      
      // Generate product images
      const images = await ImageGenerationService.generateProductImages(
        { title: content.title, description: content.description },
        settings.imageGeneration.imagesPerProduct || 3
      );
      
      // Create the product
      const product = await Product.create({
        title: content.title,
        description: content.description,
        shortDescription: content.shortDescription,
        features: content.features,
        specifications: content.specifications,
        applications: content.applications,
        faqs: content.faqs,
        category: category._id,
        images,
        metaTitle: content.metaTitle,
        metaDescription: content.metaDescription,
        schemaMarkup: content.schemaMarkup,
        keywords,
        sourceKeywords: keywords,
        isAutomated: true,
        generationStatus: 'completed',
        status: settings.productListing.requireApproval ? 'draft' : 'published',
        publishedAt: settings.productListing.requireApproval ? null : new Date()
      });
      
      console.log(`Product generated with ID: ${product._id}`);
      
      return product;
    } catch (error) {
      console.error('Error generating product:', error);
      throw new Error(`Failed to generate product: ${error.message}`);
    }
  }
  
  /**
   * Schedule products for publication based on automation settings
   * @returns {Object} Scheduling result
   */
  async scheduleProducts() {
    try {
      console.log('Scheduling products for publication');
      
      // Get automation settings
      const settings = await AutomationSettings.getSettings();
      
      if (!settings.productListing.enabled) {
        console.log('Product listing automation is disabled');
        return { success: true, message: 'Product listing automation is disabled' };
      }
      
      // Get draft products
      const draftProducts = await Product.find({
        status: 'draft',
        isAutomated: true,
        generationStatus: 'completed'
      }).sort({ createdAt: 1 });
      
      if (draftProducts.length === 0) {
        console.log('No draft products to schedule');
        return { success: true, message: 'No draft products to schedule' };
      }
      
      console.log(`Found ${draftProducts.length} draft products to schedule`);
      
      // Calculate next publication date
      let nextPublishDate = new Date();
      
      // Get the last scheduled product
      const lastScheduledProduct = await Product.findOne({
        status: 'scheduled'
      }).sort({ scheduledPublishDate: -1 });
      
      if (lastScheduledProduct) {
        nextPublishDate = new Date(lastScheduledProduct.scheduledPublishDate);
      }
      
      // Add interval based on settings
      let daysToAdd = 7; // Default to weekly
      
      switch (settings.productListing.publishFrequency) {
        case 'daily':
          daysToAdd = 1;
          break;
        case 'every_other_day':
          daysToAdd = 2;
          break;
        case 'custom':
          daysToAdd = settings.productListing.customDaysInterval || 3;
          break;
      }
      
      nextPublishDate.setDate(nextPublishDate.getDate() + daysToAdd);
      
      // Set the time from settings
      const [hours, minutes] = (settings.productListing.publishTime || '09:00').split(':');
      nextPublishDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      
      // Schedule the next product
      const productToSchedule = draftProducts[0];
      productToSchedule.status = 'scheduled';
      productToSchedule.scheduledPublishDate = nextPublishDate;
      await productToSchedule.save();
      
      console.log(`Scheduled product ${productToSchedule._id} for publication on ${nextPublishDate}`);
      
      return {
        success: true,
        product: productToSchedule,
        scheduledDate: nextPublishDate
      };
    } catch (error) {
      console.error('Error scheduling products:', error);
      throw new Error(`Failed to schedule products: ${error.message}`);
    }
  }
  
  /**
   * Publish scheduled products that are due
   * @returns {Object} Publishing result
   */
  async publishScheduledProducts() {
    try {
      console.log('Publishing scheduled products');
      
      // Find scheduled products that are due
      const scheduledProducts = await Product.find({
        status: 'scheduled',
        scheduledPublishDate: { $lte: new Date() }
      });
      
      if (scheduledProducts.length === 0) {
        console.log('No scheduled products due for publication');
        return { success: true, message: 'No scheduled products due for publication' };
      }
      
      console.log(`Found ${scheduledProducts.length} scheduled products to publish`);
      
      // Publish each product
      const publishedProducts = [];
      
      for (const product of scheduledProducts) {
        product.status = 'published';
        product.publishedAt = new Date();
        await product.save();
        
        publishedProducts.push(product);
        
        console.log(`Published product ${product._id}`);
      }
      
      return {
        success: true,
        publishedCount: publishedProducts.length,
        publishedProducts
      };
    } catch (error) {
      console.error('Error publishing scheduled products:', error);
      throw new Error(`Failed to publish scheduled products: ${error.message}`);
    }
  }
}

module.exports = new ProductGenerationService();

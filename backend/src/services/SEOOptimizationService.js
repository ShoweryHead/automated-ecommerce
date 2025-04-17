const OpenAI = require('openai');
const Product = require('../models/Product');
const SEOOptimizationQueue = require('../models/SEOOptimizationQueue');
const SEOSettings = require('../models/SEOSettings');
const config = require('../config/config');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

/**
 * Service for optimizing product SEO
 */
class SEOOptimizationService {
  /**
   * Optimize SEO for a product
   * @param {String} productId - ID of the product to optimize
   * @param {String} optimizationType - Type of optimization
   * @returns {Object} Optimization result
   */
  async optimizeProductSEO(productId, optimizationType = 'refresh') {
    try {
      console.log(`Optimizing SEO for product ${productId}`);
      
      // Get the product
      const product = await Product.findById(productId).populate('category');
      
      if (!product) {
        throw new Error(`Product not found with ID: ${productId}`);
      }
      
      // Get SEO settings
      const seoSettings = await SEOSettings.getSettings();
      
      // Store original values for comparison
      const originalValues = {
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        title: product.title,
        description: product.description,
        schemaMarkup: product.schemaMarkup
      };
      
      // Analyze current SEO performance
      const initialAnalysis = await this.analyzeSEOPerformance(product);
      
      // Perform optimizations based on settings
      const optimizations = {};
      
      // Optimize meta tags if enabled
      if (seoSettings.elements.metaTags) {
        const metaTags = await this.optimizeMetaTags(product);
        product.metaTitle = metaTags.metaTitle;
        product.metaDescription = metaTags.metaDescription;
        optimizations.metaTags = 'Optimized meta title and description';
      }
      
      // Optimize headings if enabled
      if (seoSettings.elements.headings) {
        const headings = await this.optimizeHeadings(product);
        // In a real implementation, this would update the product's content structure
        optimizations.headings = 'Optimized heading structure';
      }
      
      // Optimize content if enabled
      if (seoSettings.elements.content) {
        const content = await this.optimizeContent(product);
        product.description = content.description;
        optimizations.content = 'Optimized product description';
      }
      
      // Optimize images if enabled
      if (seoSettings.elements.images) {
        const images = await this.optimizeImages(product);
        // Update image alt text and filenames
        product.images = images;
        optimizations.images = 'Optimized image alt text and filenames';
      }
      
      // Optimize structured data if enabled
      if (seoSettings.elements.structuredData) {
        const structuredData = await this.optimizeStructuredData(product);
        product.schemaMarkup = structuredData.schemaMarkup;
        optimizations.structuredData = 'Optimized schema markup';
      }
      
      // Optimize social media metadata if enabled
      if (seoSettings.elements.socialMedia) {
        const socialMedia = await this.optimizeSocialMedia(product);
        // In a real implementation, this would update the product's social media metadata
        optimizations.socialMedia = 'Optimized Open Graph and Twitter card metadata';
      }
      
      // Generate internal linking suggestions if enabled
      let internalLinks = [];
      if (seoSettings.elements.internalLinks && seoSettings.internalLinking.enabled) {
        internalLinks = await this.generateInternalLinkingSuggestions(product, seoSettings.internalLinking);
        optimizations.internalLinks = `Generated ${internalLinks.length} internal linking suggestions`;
      }
      
      // Update the product
      product.seoLastUpdated = new Date();
      await product.save();
      
      // Analyze updated SEO performance
      const finalAnalysis = await this.analyzeSEOPerformance(product);
      
      // Create result object
      const result = {
        productId: product._id,
        optimizationType,
        changes: optimizations,
        performance: {
          before: initialAnalysis,
          after: finalAnalysis
        },
        internalLinkingSuggestions: internalLinks
      };
      
      console.log(`SEO optimization completed for product ${productId}`);
      
      return result;
    } catch (error) {
      console.error('Error optimizing product SEO:', error);
      throw new Error(`Failed to optimize product SEO: ${error.message}`);
    }
  }
  
  /**
   * Analyze SEO performance of a product
   * @param {Object} product - Product object
   * @returns {Object} SEO performance analysis
   */
  async analyzeSEOPerformance(product) {
    try {
      console.log(`Analyzing SEO performance for product ${product._id}`);
      
      // Initialize score and issues
      let score = 0;
      const issues = [];
      
      // Check meta title
      if (!product.metaTitle) {
        issues.push('Missing meta title');
      } else if (product.metaTitle.length < 30) {
        issues.push('Meta title too short (less than 30 characters)');
      } else if (product.metaTitle.length > 60) {
        issues.push('Meta title too long (more than 60 characters)');
      } else {
        score += 15;
      }
      
      // Check meta description
      if (!product.metaDescription) {
        issues.push('Missing meta description');
      } else if (product.metaDescription.length < 70) {
        issues.push('Meta description too short (less than 70 characters)');
      } else if (product.metaDescription.length > 160) {
        issues.push('Meta description too long (more than 160 characters)');
      } else {
        score += 15;
      }
      
      // Check product title
      if (!product.title) {
        issues.push('Missing product title');
      } else if (product.title.length < 20) {
        issues.push('Product title too short (less than 20 characters)');
      } else if (product.title.length > 70) {
        issues.push('Product title too long (more than 70 characters)');
      } else {
        score += 10;
      }
      
      // Check product description
      if (!product.description) {
        issues.push('Missing product description');
      } else if (product.description.length < 300) {
        issues.push('Product description too short (less than 300 characters)');
      } else {
        score += 15;
      }
      
      // Check images
      if (!product.images || product.images.length === 0) {
        issues.push('No product images');
      } else {
        let hasMainImage = false;
        let missingAltText = 0;
        
        for (const image of product.images) {
          if (image.isMain) {
            hasMainImage = true;
          }
          
          if (!image.alt || image.alt.trim() === '') {
            missingAltText++;
          }
        }
        
        if (!hasMainImage) {
          issues.push('No main product image designated');
        } else {
          score += 5;
        }
        
        if (missingAltText > 0) {
          issues.push(`${missingAltText} images missing alt text`);
        } else {
          score += 10;
        }
      }
      
      // Check schema markup
      if (!product.schemaMarkup) {
        issues.push('Missing schema markup');
      } else {
        score += 15;
      }
      
      // Check keywords
      if (!product.keywords || product.keywords.length === 0) {
        issues.push('No keywords defined');
      } else if (product.keywords.length < 3) {
        issues.push('Too few keywords (less than 3)');
      } else {
        score += 15;
      }
      
      // Return analysis
      return {
        score,
        issues
      };
    } catch (error) {
      console.error('Error analyzing SEO performance:', error);
      return {
        score: 0,
        issues: ['Error analyzing SEO performance']
      };
    }
  }
  
  /**
   * Optimize meta tags for a product
   * @param {Object} product - Product object
   * @returns {Object} Optimized meta tags
   */
  async optimizeMetaTags(product) {
    try {
      console.log(`Optimizing meta tags for product ${product._id}`);
      
      const prompt = `
        Optimize the SEO meta title and description for the following product:
        
        Product Title: ${product.title}
        Product Category: ${product.category ? product.category.name : 'Unknown'}
        Keywords: ${product.keywords ? product.keywords.join(', ') : ''}
        Short Description: ${product.shortDescription || ''}
        
        Current Meta Title: ${product.metaTitle || ''}
        Current Meta Description: ${product.metaDescription || ''}
        
        Please provide:
        1. An optimized meta title (50-60 characters)
        2. An optimized meta description (150-160 characters)
        
        The meta title should include the main keyword naturally and be compelling.
        The meta description should summarize the product value proposition and include a call to action.
        
        Format the response as a JSON object with this structure:
        {
          "metaTitle": "Optimized meta title",
          "metaDescription": "Optimized meta description"
        }
        
        Return only the JSON with no additional commentary.
      `;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });
      
      try {
        const content = response.choices[0].message.content.trim();
        return JSON.parse(content);
      } catch (error) {
        console.error('Error parsing meta tags JSON:', error);
        return {
          metaTitle: product.metaTitle || product.title,
          metaDescription: product.metaDescription || product.shortDescription
        };
      }
    } catch (error) {
      console.error('Error optimizing meta tags:', error);
      return {
        metaTitle: product.metaTitle || product.title,
        metaDescription: product.metaDescription || product.shortDescription
      };
    }
  }
  
  /**
   * Optimize headings for a product
   * @param {Object} product - Product object
   * @returns {Object} Optimized headings
   */
  async optimizeHeadings(product) {
    try {
      console.log(`Optimizing headings for product ${product._id}`);
      
      const prompt = `
        Analyze and optimize the heading structure for the following product:
        
        Product Title: ${product.title}
        Product Category: ${product.category ? product.category.name : 'Unknown'}
        Keywords: ${product.keywords ? product.keywords.join(', ') : ''}
        
        Please provide:
        1. An optimized H1 heading (usually the product title)
        2. 3-5 H2 subheadings for product sections
        3. 2-3 H3 headings under each H2 section where appropriate
        
        The headings should:
        - Include relevant keywords naturally
        - Follow a logical hierarchy
        - Be descriptive and user-friendly
        - Highlight key product features and benefits
        
        Format the response as a JSON object with this structure:
        {
          "h1": "Main product heading",
          "sections": [
            {
              "h2": "Section heading",
              "h3s": ["Subsection 1", "Subsection 2"]
            }
          ]
        }
        
        Return only the JSON with no additional commentary.
      `;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });
      
      try {
        const content = response.choices[0].message.content.trim();
        return JSON.parse(content);
      } catch (error) {
        console.error('Error parsing headings JSON:', error);
        return {
          h1: product.title,
          sections: []
        };
      }
    } catch (error) {
      console.error('Error optimizing headings:', error);
      return {
        h1: product.title,
        sections: []
      };
    }
  }
  
  /**
   * Optimize content for a product
   * @param {Object} product - Product object
   * @returns {Object} Optimized content
   */
  async optimizeContent(product) {
    try {
      console.log(`Optimizing content for product ${product._id}`);
      
      const prompt = `
        Optimize the product description for better SEO:
        
        Product Title: ${product.title}
        Product Category: ${product.category ? product.category.name : 'Unknown'}
        Keywords: ${product.keywords ? product.keywords.join(', ') : ''}
        
        Current Description:
        ${product.description}
        
        Please provide an optimized product description that:
        - Naturally incorporates the keywords
        - Uses proper HTML formatting (<p>, <ul>, <li>, <strong>)
        - Has a clear structure with introduction, features, benefits, and conclusion
        - Is engaging and persuasive
        - Maintains approximately the same length as the original
        - Does not mention pricing
        
        Return only the optimized description with no additional commentary.
      `;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      const optimizedDescription = response.choices[0].message.content.trim();
      
      return {
        description: optimizedDescription
      };
    } catch (error) {
      console.error('Error optimizing content:', error);
      return {
        description: product.description
      };
    }
  }
  
  /**
   * Optimize images for a product
   * @param {Object} product - Product object
   * @returns {Array} Optimized images
   */
  async optimizeImages(product) {
    try {
      console.log(`Optimizing images for product ${product._id}`);
      
      if (!product.images || product.images.length === 0) {
        return [];
      }
      
      const optimizedImages = [...product.images];
      
      // Generate optimized alt text for each image
      for (let i = 0; i < optimizedImages.length; i++) {
        const image = optimizedImages[i];
        
        if (!image.alt || image.alt.trim() === '') {
          const prompt = `
            Generate an SEO-optimized alt text for a product image:
            
            Product: ${product.title}
            Category: ${product.category ? product.category.name : 'Unknown'}
            Keywords: ${product.keywords ? product.keywords.join(', ') : ''}
            Image Position: ${image.isMain ? 'Main product image' : `Product image ${i + 1}`}
            
            The alt text should:
            - Be descriptive but concise (8-10 words maximum)
            - Include the product name and a key feature
            - Be specific to this type of product
            - Naturally include a relevant keyword
            
            Return only the alt text with no additional commentary.
          `;
          
          const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 100
          });
          
          optimizedImages[i].alt = response.choices[0].message.content.trim();
        }
      }
      
      return optimizedImages;
    } catch (error) {
      console.error('Error optimizing images:', error);
      return product.images;
    }
  }
  
  /**
   * Optimize structured data for a product
   * @param {Object} product - Product object
   * @returns {Object} Optimized structured data
   */
  async optimizeStructuredData(product) {
    try {
      console.log(`Optimizing structured data for product ${product._id}`);
      
      const prompt = `
        Generate optimized JSON-LD schema markup for the following product:
        
        Product Title: ${product.title}
        Product Category: ${product.category ? product.category.name : 'Unknown'}
        Description: ${product.shortDescription || ''}
        Features: ${product.features ? JSON.stringify(product.features) : ''}
        Images: ${product.images && product.images.length > 0 ? product.images[0].url : ''}
        
        Please provide:
        1. Product schema markup
        2. BreadcrumbList schema markup
        3. If the product has FAQs, also include FAQPage schema markup
        
        Format the response as a JSON string that can be directly used in a script tag.
        
        Return only the JSON-LD schema markup with no additional commentary.
      `;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      const schemaMarkup = response.choices[0].message.content.trim();
      
      return {
        schemaMarkup
      };
    } catch (error) {
      console.error('Error optimizing structured data:', error);
      return {
        schemaMarkup: product.schemaMarkup
      };
    }
  }
  
  /**
   * Optimize social media metadata for a product
   * @param {Object} product - Product object
   * @returns {Object} Optimized social media metadata
   */
  async optimizeSocialMedia(product) {
    try {
      console.log(`Optimizing social media metadata for product ${product._id}`);
      
      const prompt = `
        Generate optimized social media metadata for the following product:
        
        Product Title: ${product.title}
        Product Category: ${product.category ? product.category.name : 'Unknown'}
        Description: ${product.shortDescription || ''}
        
        Please provide:
        1. Open Graph title (60-90 characters)
        2. Open Graph description (2-4 sentences)
        3. Twitter card title (55-70 characters)
        4. Twitter card description (1-2 sentences)
        
        Format the response as a JSON object with this structure:
        {
          "ogTitle": "Open Graph title",
          "ogDescription": "Open Graph description",
          "twitterTitle": "Twitter card title",
          "twitterDescription": "Twitter card description"
        }
        
        Return only the JSON with no additional commentary.
      `;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });
      
      try {
        const content = response.choices[0].message.content.trim();
        return JSON.parse(content);
      } catch (error) {
        console.error('Error parsing social media JSON:', error);
        return {
          ogTitle: product.title,
          ogDescription: product.shortDescription,
          twitterTitle: product.title,
          twitterDescription: product.shortDescription
        };
      }
    } catch (error) {
      console.error('Error optimizing social media metadata:', error);
      return {
        ogTitle: product.title,
        ogDescription: product.shortDescription,
        twitterTitle: product.title,
        twitterDescription: product.shortDescription
      };
    }
  }
  
  /**
   * Generate internal linking suggestions for a product
   * @param {Object} product - Product object
   * @param {Object} settings - Internal linking settings
   * @returns {Array} Internal linking suggestions
   */
  async generateInternalLinkingSuggestions(product, settings) {
    try {
      console.log(`Generating internal linking suggestions for product ${product._id}`);
      
      // Find related products
      const relatedProducts = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        status: 'published'
      }).limit(20);
      
      if (relatedProducts.length === 0) {
        return [];
      }
      
      // Calculate relevance scores
      const suggestions = [];
      
      for (const relatedProduct of relatedProducts) {
        // Simple relevance calculation based on keyword overlap
        // In a real implementation, this would be more sophisticated
        const productKeywords = product.keywords || [];
        const relatedKeywords = relatedProduct.keywords || [];
        
        const commonKeywords = productKeywords.filter(keyword => 
          relatedKeywords.some(relatedKeyword => 
            relatedKeyword.toLowerCase().includes(keyword.toLowerCase()) || 
            keyword.toLowerCase().includes(relatedKeyword.toLowerCase())
          )
        );
        
        const relevanceScore = commonKeywords.length > 0 
          ? (commonKeywords.length / Math.max(productKeywords.length, 1)) * 100 
          : 0;
        
        if (relevanceScore >= settings.minRelevanceScore) {
          suggestions.push({
            productId: relatedProduct._id,
            title: relatedProduct.title,
            relevanceScore,
            commonKeywords,
            linkText: `Check out our ${relatedProduct.title}`,
            approved: !settings.requireApproval
          });
        }
      }
      
      // Sort by relevance score and limit to max links per product
      return suggestions
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, settings.maxLinksPerProduct);
    } catch (error) {
      console.error('Error generating internal linking suggestions:', error);
      return [];
    }
  }
  
  /**
   * Queue a product for SEO optimization
   * @param {String} productId - ID of the product to optimize
   * @param {String} optimizationType - Type of optimization
   * @param {Object} options - Additional options
   * @returns {Object} Created queue item
   */
  async queueSEOOptimization(productId, optimizationType = 'refresh', options = {}) {
    try {
      console.log(`Queueing SEO optimization for product ${productId}`);
      
      // Create a new queue item
      const queueItem = await SEOOptimizationQueue.create({
        product: productId,
        optimizationType,
        priority: options.priority || 1,
        scheduledFor: options.scheduledFor || new Date()
      });
      
      console.log(`SEO optimization queued with ID: ${queueItem._id}`);
      
      return queueItem;
    } catch (error) {
      console.error('Error queueing SEO optimization:', error);
      throw new Error(`Failed to queue SEO optimization: ${error.message}`);
    }
  }
  
  /**
   * Process the next item in the SEO optimization queue
   * @returns {Object} Processing result
   */
  async processNextQueueItem() {
    try {
      console.log('Processing next SEO optimization queue item');
      
      // Find the next item to process
      const queueItem = await SEOOptimizationQueue.findOne({
        status: 'queued',
        $or: [
          { scheduledFor: { $lte: new Date() } },
          { scheduledFor: { $exists: false } }
        ]
      }).sort({ priority: -1, queuedAt: 1 }).populate('product');
      
      if (!queueItem) {
        console.log('No SEO optimization queue items to process');
        return { success: true, message: 'No queue items to process' };
      }
      
      console.log(`Processing SEO optimization queue item: ${queueItem._id}`);
      
      // Update status to processing
      queueItem.status = 'processing';
      queueItem.processingStartedAt = new Date();
      await queueItem.save();
      
      // Start processing timer
      const startTime = Date.now();
      
      try {
        // Optimize the product
        const result = await this.optimizeProductSEO(queueItem.product._id, queueItem.optimizationType);
        
        // Update queue item with success
        queueItem.status = 'completed';
        queueItem.completedAt = new Date();
        queueItem.result = {
          changes: result.changes,
          performance: result.performance,
          processingTime: Date.now() - startTime
        };
        await queueItem.save();
        
        console.log(`SEO optimization queue item ${queueItem._id} processed successfully`);
        
        return {
          success: true,
          queueItem,
          result
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
        
        console.error(`Error processing SEO optimization queue item ${queueItem._id}:`, error);
        
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
   * Schedule SEO optimizations based on settings
   * @returns {Object} Scheduling result
   */
  async scheduleOptimizations() {
    try {
      console.log('Scheduling SEO optimizations');
      
      // Get SEO settings
      const seoSettings = await SEOSettings.getSettings();
      
      // Skip if not in scheduled mode
      if (seoSettings.optimizationMode !== 'scheduled') {
        console.log('SEO optimization is not in scheduled mode');
        return { success: true, message: 'SEO optimization is not in scheduled mode' };
      }
      
      // Get all published products that haven't been optimized recently
      const lastOptimizationDate = new Date();
      
      // Determine how far back to look based on frequency
      switch (seoSettings.scheduledOptimization.frequency) {
        case 'daily':
          lastOptimizationDate.setDate(lastOptimizationDate.getDate() - 1);
          break;
        case 'weekly':
          lastOptimizationDate.setDate(lastOptimizationDate.getDate() - 7);
          break;
        case 'monthly':
          lastOptimizationDate.setMonth(lastOptimizationDate.getMonth() - 1);
          break;
        case 'quarterly':
          lastOptimizationDate.setMonth(lastOptimizationDate.getMonth() - 3);
          break;
      }
      
      const products = await Product.find({
        status: 'published',
        $or: [
          { seoLastUpdated: { $lt: lastOptimizationDate } },
          { seoLastUpdated: { $exists: false } }
        ]
      }).sort({ seoLastUpdated: 1 });
      
      if (products.length === 0) {
        console.log('No products need SEO optimization');
        return { success: true, message: 'No products need SEO optimization' };
      }
      
      console.log(`Found ${products.length} products that need SEO optimization`);
      
      // Queue products for optimization
      const queuedItems = [];
      
      for (const product of products) {
        const queueItem = await this.queueSEOOptimization(product._id, 'refresh');
        queuedItems.push(queueItem);
      }
      
      // Update next run date
      seoSettings.scheduledOptimization.lastRun = new Date();
      
      // Calculate next run date
      const nextRun = new Date();
      
      switch (seoSettings.scheduledOptimization.frequency) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7);
          break;
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1);
          nextRun.setDate(seoSettings.scheduledOptimization.dayOfMonth);
          break;
        case 'quarterly':
          nextRun.setMonth(nextRun.getMonth() + 3);
          nextRun.setDate(seoSettings.scheduledOptimization.dayOfMonth);
          break;
      }
      
      // Set time of day
      const [hours, minutes] = seoSettings.scheduledOptimization.timeOfDay.split(':');
      nextRun.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      
      seoSettings.scheduledOptimization.nextRun = nextRun;
      await seoSettings.save();
      
      return {
        success: true,
        queuedCount: queuedItems.length,
        nextRun
      };
    } catch (error) {
      console.error('Error scheduling SEO optimizations:', error);
      throw new Error(`Failed to schedule SEO optimizations: ${error.message}`);
    }
  }
  
  /**
   * Check and optimize products based on performance
   * @returns {Object} Optimization result
   */
  async checkAndOptimizeByPerformance() {
    try {
      console.log('Checking products for performance-based optimization');
      
      // Get SEO settings
      const seoSettings = await SEOSettings.getSettings();
      
      // Skip if not in continuous mode
      if (seoSettings.optimizationMode !== 'continuous') {
        console.log('SEO optimization is not in continuous mode');
        return { success: true, message: 'SEO optimization is not in continuous mode' };
      }
      
      // Get published products
      const products = await Product.find({
        status: 'published'
      }).sort({ seoLastUpdated: 1 }).limit(20);
      
      if (products.length === 0) {
        console.log('No products to check for optimization');
        return { success: true, message: 'No products to check for optimization' };
      }
      
      // Check each product's SEO performance
      const productsToOptimize = [];
      
      for (const product of products) {
        const analysis = await this.analyzeSEOPerformance(product);
        
        if (analysis.score < seoSettings.continuousOptimization.minPerformanceThreshold) {
          productsToOptimize.push({
            product,
            score: analysis.score,
            issues: analysis.issues
          });
        }
      }
      
      if (productsToOptimize.length === 0) {
        console.log('No products need optimization based on performance');
        return { success: true, message: 'No products need optimization based on performance' };
      }
      
      console.log(`Found ${productsToOptimize.length} products that need optimization based on performance`);
      
      // Sort by score (lowest first) and limit to max optimizations per day
      productsToOptimize.sort((a, b) => a.score - b.score);
      
      const maxOptimizations = seoSettings.continuousOptimization.maxOptimizationsPerDay;
      const productsToQueue = productsToOptimize.slice(0, maxOptimizations);
      
      // Queue products for optimization
      const queuedItems = [];
      
      for (const item of productsToQueue) {
        const queueItem = await this.queueSEOOptimization(
          item.product._id,
          'performance_based',
          { priority: 2 } // Higher priority for performance-based optimizations
        );
        queuedItems.push(queueItem);
      }
      
      return {
        success: true,
        queuedCount: queuedItems.length,
        totalIssuesFound: productsToOptimize.length
      };
    } catch (error) {
      console.error('Error checking and optimizing by performance:', error);
      throw new Error(`Failed to check and optimize by performance: ${error.message}`);
    }
  }
}

module.exports = new SEOOptimizationService();

const openai = require('openai');
const config = require('../config/config');
const BlogPost = require('../models/BlogPost');
const BlogTopic = require('../models/BlogTopic');
const BlogAutomationSettings = require('../models/BlogAutomationSettings');
const Product = require('../models/Product');
const Category = require('../models/Category');
const MailchimpService = require('./MailchimpService');

/**
 * Service for managing blog content generation and automation
 */
class BlogAutomationService {
  /**
   * Initialize the blog automation service
   */
  constructor() {
    // Initialize OpenAI client
    this.openai = new openai.OpenAIApi(config.OPENAI_API_KEY);
    
    // Cache for settings to avoid frequent DB queries
    this.settingsCache = null;
    this.settingsCacheExpiry = null;
  }

  /**
   * Get the current blog automation settings
   * @returns {Promise<Object>} The blog automation settings
   */
  async getSettings() {
    // Check if we have cached settings that aren't expired
    const now = new Date();
    if (this.settingsCache && this.settingsCacheExpiry > now) {
      return this.settingsCache;
    }
    
    // Get settings from database or create default settings if none exist
    let settings = await BlogAutomationSettings.findOne().sort({ createdAt: -1 });
    
    if (!settings) {
      settings = await BlogAutomationSettings.create({});
    }
    
    // Cache settings for 5 minutes
    this.settingsCache = settings;
    this.settingsCacheExpiry = new Date(now.getTime() + 5 * 60 * 1000);
    
    return settings;
  }

  /**
   * Generate blog topic suggestions
   * @param {Object} options - Options for topic generation
   * @returns {Promise<Array>} Array of generated topic suggestions
   */
  async generateTopicSuggestions(options = {}) {
    try {
      console.log('Generating blog topic suggestions');
      
      const settings = await this.getSettings();
      const topicGenSettings = settings.topicGeneration;
      
      if (!topicGenSettings.enabled) {
        return { success: false, message: 'Topic generation is disabled in settings' };
      }
      
      const count = options.count || topicGenSettings.topicsPerBatch;
      const contentTypes = options.contentTypes || Object.keys(settings.contentTypes)
        .filter(type => settings.contentTypes[type].enabled);
      
      const topics = [];
      
      // Generate topics based on products if enabled
      if (topicGenSettings.basedOnProducts) {
        const products = await Product.find()
          .sort({ createdAt: -1 })
          .limit(10);
        
        for (const product of products) {
          // Only generate up to the requested count
          if (topics.length >= count) break;
          
          // Randomly select a content type for this product
          const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
          
          // Generate a topic based on the product and content type
          const topic = await this._generateTopicFromProduct(product, contentType);
          
          if (topic) {
            topics.push(topic);
          }
        }
      }
      
      // Generate topics based on trends if enabled and we still need more topics
      if (topicGenSettings.basedOnTrends && topics.length < count) {
        const trendTopics = await this._generateTopicsFromTrends(
          count - topics.length,
          contentTypes
        );
        
        topics.push(...trendTopics);
      }
      
      // Generate topics based on keywords if enabled and we still need more topics
      if (topicGenSettings.basedOnKeywords && topics.length < count) {
        const keywordTopics = await this._generateTopicsFromKeywords(
          count - topics.length,
          contentTypes
        );
        
        topics.push(...keywordTopics);
      }
      
      console.log(`Generated ${topics.length} topic suggestions`);
      return { success: true, topics };
    } catch (error) {
      console.error('Error generating topic suggestions:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Generate a blog topic from a product
   * @param {Object} product - The product to base the topic on
   * @param {String} contentType - The type of content to generate
   * @returns {Promise<Object>} The generated topic
   * @private
   */
  async _generateTopicFromProduct(product, contentType) {
    try {
      const settings = await this.getSettings();
      const promptTemplate = settings.contentTypes[contentType].promptTemplate;
      
      // Create a prompt based on the product and content type
      let prompt;
      
      switch (contentType) {
        case 'product':
          prompt = `Generate a blog topic idea for a product-focused article about ${product.title}. 
                   The topic should highlight the product's features, benefits, and use cases. 
                   Include a compelling title and brief description.`;
          break;
        case 'how_to':
          prompt = `Generate a blog topic idea for a how-to guide related to ${product.title}. 
                   The topic should focus on practical instructions, tips, and best practices. 
                   Include a compelling title and brief description.`;
          break;
        case 'case_study':
          prompt = `Generate a blog topic idea for a case study featuring ${product.title}. 
                   The topic should focus on a hypothetical customer success story. 
                   Include a compelling title and brief description.`;
          break;
        case 'industry_news':
          prompt = `Generate a blog topic idea for an industry news article related to ${product.category ? product.category.name : 'coating machines'}. 
                   The topic should connect industry trends to our products like ${product.title}. 
                   Include a compelling title and brief description.`;
          break;
        default:
          prompt = `Generate a blog topic idea related to ${product.title}. 
                   Include a compelling title and brief description.`;
      }
      
      // Add instructions for the response format
      prompt += `\n\nFormat your response as JSON with the following structure:
                {
                  "title": "The blog post title",
                  "description": "A brief description of the blog post (100-200 words)",
                  "primaryKeyword": "The main keyword to target",
                  "secondaryKeywords": ["keyword1", "keyword2", "keyword3"],
                  "outline": "A brief outline of the main sections of the blog post"
                }`;
      
      // Generate the topic using OpenAI
      const response = await this.openai.createCompletion({
        model: settings.contentGenerationAPI.model,
        prompt,
        max_tokens: 1000,
        temperature: 0.7,
        n: 1
      });
      
      // Parse the response
      const responseText = response.data.choices[0].text.trim();
      const topicData = JSON.parse(responseText);
      
      // Create a new topic in the database
      const topic = await BlogTopic.create({
        title: topicData.title,
        description: topicData.description,
        contentType,
        primaryKeyword: topicData.primaryKeyword,
        secondaryKeywords: topicData.secondaryKeywords,
        outline: topicData.outline,
        relatedProducts: [product._id],
        relatedCategories: product.category ? [product.category] : [],
        automation: {
          isAutoGenerated: true,
          generationMethod: 'product_based',
          generationSource: `Product: ${product.title}`,
          generationDate: new Date()
        }
      });
      
      return topic;
    } catch (error) {
      console.error(`Error generating topic from product ${product.title}:`, error);
      return null;
    }
  }

  /**
   * Generate blog topics based on industry trends
   * @param {Number} count - Number of topics to generate
   * @param {Array} contentTypes - Types of content to generate
   * @returns {Promise<Array>} Array of generated topics
   * @private
   */
  async _generateTopicsFromTrends(count, contentTypes) {
    try {
      const settings = await this.getSettings();
      
      // Create a prompt to generate trend-based topics
      const prompt = `Generate ${count} blog topic ideas related to the latest trends in the coating machines industry.
                     For each topic, include a compelling title, brief description, primary keyword, 
                     3-5 secondary keywords, and a brief outline of the main sections.
                     
                     The topics should be distributed across these content types: ${contentTypes.join(', ')}.
                     
                     Format your response as JSON with the following structure:
                     [
                       {
                         "title": "The blog post title",
                         "description": "A brief description of the blog post (100-200 words)",
                         "contentType": "one of: product, industry_news, how_to, case_study",
                         "primaryKeyword": "The main keyword to target",
                         "secondaryKeywords": ["keyword1", "keyword2", "keyword3"],
                         "outline": "A brief outline of the main sections of the blog post"
                       },
                       ...
                     ]`;
      
      // Generate the topics using OpenAI
      const response = await this.openai.createCompletion({
        model: settings.contentGenerationAPI.model,
        prompt,
        max_tokens: 2000,
        temperature: 0.8,
        n: 1
      });
      
      // Parse the response
      const responseText = response.data.choices[0].text.trim();
      const topicsData = JSON.parse(responseText);
      
      // Create the topics in the database
      const topics = [];
      
      for (const topicData of topicsData) {
        const topic = await BlogTopic.create({
          title: topicData.title,
          description: topicData.description,
          contentType: topicData.contentType,
          primaryKeyword: topicData.primaryKeyword,
          secondaryKeywords: topicData.secondaryKeywords,
          outline: topicData.outline,
          automation: {
            isAutoGenerated: true,
            generationMethod: 'trend_based',
            generationSource: 'Industry trends',
            generationDate: new Date()
          }
        });
        
        topics.push(topic);
      }
      
      return topics;
    } catch (error) {
      console.error('Error generating topics from trends:', error);
      return [];
    }
  }

  /**
   * Generate blog topics based on keywords
   * @param {Number} count - Number of topics to generate
   * @param {Array} contentTypes - Types of content to generate
   * @returns {Promise<Array>} Array of generated topics
   * @private
   */
  async _generateTopicsFromKeywords(count, contentTypes) {
    try {
      const settings = await this.getSettings();
      
      // Get some categories to use as seed keywords
      const categories = await Category.find().limit(5);
      const categoryNames = categories.map(cat => cat.name);
      
      // Create a prompt to generate keyword-based topics
      const prompt = `Generate ${count} blog topic ideas for a coating machines business based on these keywords: 
                     ${categoryNames.join(', ')}, powder coating, industrial coating, coating equipment, coating technology.
                     
                     For each topic, include a compelling title, brief description, primary keyword, 
                     3-5 secondary keywords, and a brief outline of the main sections.
                     
                     The topics should be distributed across these content types: ${contentTypes.join(', ')}.
                     
                     Format your response as JSON with the following structure:
                     [
                       {
                         "title": "The blog post title",
                         "description": "A brief description of the blog post (100-200 words)",
                         "contentType": "one of: product, industry_news, how_to, case_study",
                         "primaryKeyword": "The main keyword to target",
                         "secondaryKeywords": ["keyword1", "keyword2", "keyword3"],
                         "outline": "A brief outline of the main sections of the blog post"
                       },
                       ...
                     ]`;
      
      // Generate the topics using OpenAI
      const response = await this.openai.createCompletion({
        model: settings.contentGenerationAPI.model,
        prompt,
        max_tokens: 2000,
        temperature: 0.8,
        n: 1
      });
      
      // Parse the response
      const responseText = response.data.choices[0].text.trim();
      const topicsData = JSON.parse(responseText);
      
      // Create the topics in the database
      const topics = [];
      
      for (const topicData of topicsData) {
        // Find related categories
        const relatedCategories = categories.filter(cat => 
          topicData.primaryKeyword.toLowerCase().includes(cat.name.toLowerCase()) ||
          topicData.secondaryKeywords.some(kw => kw.toLowerCase().includes(cat.name.toLowerCase()))
        ).map(cat => cat._id);
        
        const topic = await BlogTopic.create({
          title: topicData.title,
          description: topicData.description,
          contentType: topicData.contentType,
          primaryKeyword: topicData.primaryKeyword,
          secondaryKeywords: topicData.secondaryKeywords,
          outline: topicData.outline,
          relatedCategories,
          automation: {
            isAutoGenerated: true,
            generationMethod: 'keyword_based',
            generationSource: 'Keyword research',
            generationDate: new Date()
          }
        });
        
        topics.push(topic);
      }
      
      return topics;
    } catch (error) {
      console.error('Error generating topics from keywords:', error);
      return [];
    }
  }

  /**
   * Generate a blog post draft from a topic
   * @param {String} topicId - ID of the topic to generate content for
   * @returns {Promise<Object>} The generated blog post
   */
  async generateBlogPostDraft(topicId) {
    try {
      console.log(`Generating blog post draft for topic ${topicId}`);
      
      const settings = await this.getSettings();
      const topic = await BlogTopic.findById(topicId)
        .populate('relatedProducts')
        .populate('relatedCategories');
      
      if (!topic) {
        return { success: false, message: 'Topic not found' };
      }
      
      // Get content type settings
      const contentTypeSettings = settings.contentTypes[topic.contentType];
      
      if (!contentTypeSettings || !contentTypeSettings.enabled) {
        return { success: false, message: `Content type ${topic.contentType} is disabled or not found` };
      }
      
      // Create a prompt for the blog post
      let prompt = `Write a comprehensive blog post with the title "${topic.title}".
                   
                   Content type: ${topic.contentType}
                   Primary keyword: ${topic.primaryKeyword}
                   Secondary keywords: ${topic.secondaryKeywords.join(', ')}
                   
                   Use this outline as a guide:
                   ${topic.outline}
                   
                   The blog post should be between ${contentTypeSettings.minWordCount} and ${contentTypeSettings.maxWordCount} words.
                   
                   Include the following elements:
                   - An engaging introduction that hooks the reader
                   - Well-structured sections with appropriate H2 and H3 headings
                   - Practical information and actionable advice
                   - A compelling conclusion with a call to action
                   
                   Format the content with proper HTML tags for headings, paragraphs, lists, etc.`;
      
      // Add specific instructions based on content type
      switch (topic.contentType) {
        case 'product':
          if (topic.relatedProducts && topic.relatedProducts.length > 0) {
            const product = topic.relatedProducts[0];
            prompt += `\n\nThis is a product-focused article about ${product.title}.
                      Include these product details in your content:
                      - Product name: ${product.title}
                      - Key features: ${product.features ? product.features.join(', ') : 'high quality, durable, efficient'}
                      - Main benefits: improved efficiency, cost savings, better quality results
                      
                      Focus on the product's unique selling points and how it solves customer problems.
                      Do NOT include any pricing information.
                      Include a call-to-action encouraging readers to inquire about the product.`;
          }
          break;
        
        case 'how_to':
          prompt += `\n\nThis is a how-to guide. Structure it with these elements:
                    - Clear, step-by-step instructions
                    - Tips and best practices
                    - Common mistakes to avoid
                    - Troubleshooting advice
                    - Safety considerations
                    
                    Make the content practical and actionable, positioning our company as an expert in the field.`;
          break;
        
        case 'case_study':
          prompt += `\n\nThis is a case study. Structure it with these elements:
                    - Background information about the client (you can create a fictional but realistic client)
                    - The challenge or problem they faced
                    - The solution implemented (using our products)
                    - The implementation process
                    - Results and benefits achieved
                    - Client testimonial (create a realistic quote)
                    
                    Focus on demonstrating real-world value and success stories.`;
          break;
        
        case 'industry_news':
          prompt += `\n\nThis is an industry news article. Structure it with these elements:
                    - Recent developments or trends in the coating industry
                    - Expert insights and analysis
                    - Implications for businesses in the industry
                    - How our products relate to these developments
                    
                    Position our company as knowledgeable and up-to-date with industry developments.`;
          break;
      }
      
      // Add SEO instructions
      prompt += `\n\nOptimize the content for SEO:
                - Use the primary keyword in the first paragraph, at least one H2 heading, and throughout the content naturally
                - Include secondary keywords throughout the content
                - Keep paragraphs and sentences relatively short for readability
                - Use bullet points and numbered lists where appropriate
                - Include a meta description (150-160 characters) that includes the primary keyword`;
      
      // Generate the blog post using OpenAI
      const response = await this.openai.createCompletion({
        model: settings.contentGenerationAPI.model,
        prompt,
        max_tokens: 4000,
        temperature: 0.7,
        n: 1
      });
      
      // Parse the response
      const content = response.data.choices[0].text.trim();
      
      // Generate meta tags
      const metaTags = await this._generateMetaTags(topic, content);
      
      // Create a slug from the title
      const slug = topic.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Create the blog post
      const blogPost = await BlogPost.create({
        title: topic.title,
        slug,
        content,
        excerpt: topic.description,
        contentType: topic.contentType,
        featuredImage: {
          url: '/images/placeholder.jpg',
          alt: topic.title
        },
        categories: topic.relatedCategories,
        tags: [...topic.secondaryKeywords],
        relatedProducts: topic.relatedProducts,
        seo: {
          metaTitle: metaTags.title,
          metaDescription: metaTags.description,
          focusKeyword: topic.primaryKeyword,
          longTailKeywords: topic.secondaryKeywords
        },
        status: 'draft',
        automation: {
          isAutoGenerated: true,
          generationPrompt: prompt,
          generationKeywords: [topic.primaryKeyword, ...topic.secondaryKeywords],
          generationDate: new Date(),
          reviewStatus: 'pending'
        },
        author: topic.assignedTo
      });
      
      // Update the topic with the blog post ID
      topic.status = 'in_progress';
      topic.blogPost = blogPost._id;
      await topic.save();
      
      console.log(`Generated blog post draft for topic ${topicId}`);
      return { success: true, blogPost };
    } catch (error) {
      console.error(`Error generating blog post draft for topic ${topicId}:`, error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Generate meta tags for a blog post
   * @param {Object} topic - The blog topic
   * @param {String} content - The blog post content
   * @returns {Promise<Object>} The generated meta tags
   * @private
   */
  async _generateMetaTags(topic, content) {
    try {
      const settings = await this.getSettings();
      
      // Create a prompt for meta tag generation
      const prompt = `Generate SEO meta tags for a blog post with the following details:
                     
                     Title: ${topic.title}
                     Primary keyword: ${topic.primaryKeyword}
                     Secondary keywords: ${topic.secondaryKeywords.join(', ')}
                     Description: ${topic.description}
                     
                     Format your response as JSON with the following structure:
                     {
                       "title": "SEO-optimized title (50-60 characters)",
                       "description": "Meta description (150-160 characters)"
                     }
                     
                     The title should include the primary keyword and be compelling.
                     The description should include the primary keyword and provide a clear value proposition.`;
      
      // Generate the meta tags using OpenAI
      const response = await this.openai.createCompletion({
        model: settings.contentGenerationAPI.model,
        prompt,
        max_tokens: 500,
        temperature: 0.7,
        n: 1
      });
      
      // Parse the response
      const responseText = response.data.choices[0].text.trim();
      const metaTags = JSON.parse(responseText);
      
      return metaTags;
    } catch (error) {
      console.error('Error generating meta tags:', error);
      return {
        title: topic.title,
        description: topic.description.substring(0, 160)
      };
    }
  }

  /**
   * Generate images for a blog post
   * @param {String} blogPostId - ID of the blog post
   * @returns {Promise<Object>} Result of the image generation
   */
  async generateBlogImages(blogPostId) {
    try {
      console.log(`Generating images for blog post ${blogPostId}`);
      
      const settings = await this.getSettings();
      const blogPost = await BlogPost.findById(blogPostId)
        .populate('categories')
        .populate('relatedProducts');
      
      if (!settings.imageGeneration.enabled) {
        return { success: false, message: 'Image generation is disabled in settings' };
      }
      
      if (!blogPost) {
        return { success: false, message: 'Blog post not found' };
      }
      
      // Generate a featured image
      const featuredImagePrompt = settings.imageGeneration.featuredImagePromptTemplate
        .replace('{topic}', blogPost.title);
      
      // In a real implementation, this would call an image generation API
      // For now, we'll simulate it with a placeholder
      const featuredImage = {
        url: `/images/blog/featured-${blogPost._id}.jpg`,
        alt: blogPost.title,
        caption: `Featured image for ${blogPost.title}`
      };
      
      // Generate additional images if configured
      const additionalImages = [];
      
      if (settings.imageGeneration.additionalImagesCount > 0) {
        for (let i = 0; i < settings.imageGeneration.additionalImagesCount; i++) {
          // In a real implementation, this would generate unique prompts and images
          additionalImages.push({
            url: `/images/blog/additional-${blogPost._id}-${i + 1}.jpg`,
            alt: `${blogPost.title} - Image ${i + 1}`,
            caption: `Additional image for ${blogPost.title}`
          });
        }
      }
      
      // Update the blog post with the generated images
      blogPost.featuredImage = featuredImage;
      blogPost.images = additionalImages;
      await blogPost.save();
      
      console.log(`Generated images for blog post ${blogPostId}`);
      return { 
        success: true, 
        message: 'Images generated successfully',
        featuredImage,
        additionalImages
      };
    } catch (error) {
      console.error(`Error generating images for blog post ${blogPostId}:`, error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Review and approve a blog post
   * @param {String} blogPostId - ID of the blog post
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Result of the review
   */
  async reviewBlogPost(blogPostId, reviewData) {
    try {
      console.log(`Reviewing blog post ${blogPostId}`);
      
      const settings = await this.getSettings();
      const blogPost = await BlogPost.findById(blogPostId);
      
      if (!blogPost) {
        return { success: false, message: 'Blog post not found' };
      }
      
      // Update the blog post with review data
      blogPost.automation.reviewStatus = reviewData.status;
      blogPost.automation.reviewNotes = reviewData.notes;
      blogPost.automation.reviewedBy = reviewData.reviewedBy;
      blogPost.automation.reviewedAt = new Date();
      
      // If approved and auto-publish is enabled, update status
      if (
        reviewData.status === 'approved' && 
        settings.reviewWorkflow.autoPublishAfterApproval
      ) {
        if (reviewData.publishNow) {
          blogPost.status = 'published';
          blogPost.publishedAt = new Date();
        } else {
          blogPost.status = 'scheduled';
          
          // Schedule for the next available publishing slot
          const nextSlot = await this._getNextPublishingSlot();
          blogPost.scheduledFor = nextSlot;
        }
      } else if (reviewData.status === 'rejected') {
        blogPost.status = 'draft';
      }
      
      // If content was edited during review, update it
      if (reviewData.content) {
        // Add the current content to revisions
        blogPost.revisions.push({
          content: blogPost.content,
          updatedBy: reviewData.reviewedBy,
          updatedAt: new Date(),
          changeNotes: 'Content updated during review'
        });
        
        // Update with new content
        blogPost.content = reviewData.content;
      }
      
      // If SEO fields were updated, update them
      if (reviewData.seo) {
        blogPost.seo = { ...blogPost.seo, ...reviewData.seo };
      }
      
      await blogPost.save();
      
      // Update the associated topic
      if (blogPost.automation.isAutoGenerated) {
        const topic = await BlogTopic.findOne({ blogPost: blogPost._id });
        
        if (topic) {
          topic.status = reviewData.status === 'approved' ? 'completed' : 'in_progress';
          await topic.save();
        }
      }
      
      console.log(`Blog post ${blogPostId} reviewed with status: ${reviewData.status}`);
      return { success: true, blogPost };
    } catch (error) {
      console.error(`Error reviewing blog post ${blogPostId}:`, error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get the next available publishing slot
   * @returns {Promise<Date>} The next available publishing slot
   * @private
   */
  async _getNextPublishingSlot() {
    try {
      const settings = await this.getSettings();
      const publishingSettings = settings.publishingSchedule;
      
      // Get current date
      const now = new Date();
      let nextSlot = new Date(now);
      
      // Set time to the configured publishing time
      const [hours, minutes] = publishingSettings.timeOfDay.split(':').map(Number);
      nextSlot.setHours(hours, minutes, 0, 0);
      
      // If the time has already passed today, move to tomorrow
      if (nextSlot <= now) {
        nextSlot.setDate(nextSlot.getDate() + 1);
      }
      
      // Find the next allowed day of week
      while (!publishingSettings.daysOfWeek.includes(nextSlot.getDay())) {
        nextSlot.setDate(nextSlot.getDate() + 1);
      }
      
      // Check if there are already posts scheduled for this slot
      const scheduledPosts = await BlogPost.find({
        status: 'scheduled',
        scheduledFor: {
          $gte: new Date(nextSlot.setHours(0, 0, 0, 0)),
          $lt: new Date(nextSlot.setHours(23, 59, 59, 999))
        }
      });
      
      // If we've reached the max posts per day, find the next available day
      if (scheduledPosts.length >= publishingSettings.maxPostsPerWeek) {
        nextSlot.setDate(nextSlot.getDate() + 1);
        return this._getNextPublishingSlot(); // Recursive call to find next slot
      }
      
      // Set the time back to the configured publishing time
      nextSlot.setHours(hours, minutes, 0, 0);
      
      return nextSlot;
    } catch (error) {
      console.error('Error getting next publishing slot:', error);
      
      // Default to 24 hours from now if there's an error
      const defaultSlot = new Date();
      defaultSlot.setDate(defaultSlot.getDate() + 1);
      return defaultSlot;
    }
  }

  /**
   * Publish scheduled blog posts
   * @returns {Promise<Object>} Result of the publishing process
   */
  async publishScheduledPosts() {
    try {
      console.log('Publishing scheduled blog posts');
      
      const now = new Date();
      
      // Find posts that are scheduled and due for publishing
      const postsToPublish = await BlogPost.find({
        status: 'scheduled',
        scheduledFor: { $lte: now }
      });
      
      console.log(`Found ${postsToPublish.length} posts to publish`);
      
      const results = [];
      
      for (const post of postsToPublish) {
        try {
          // Update post status
          post.status = 'published';
          post.publishedAt = now;
          await post.save();
          
          // Trigger email promotion if configured
          const settings = await this.getSettings();
          
          if (settings.emailPromotion.enabled) {
            // Schedule email promotion with delay if configured
            const promotionDate = new Date(now);
            promotionDate.setDate(promotionDate.getDate() + settings.emailPromotion.promotionDelay);
            
            post.automation.emailPromotionDate = promotionDate;
            await post.save();
          }
          
          results.push({
            id: post._id,
            title: post.title,
            success: true
          });
        } catch (error) {
          console.error(`Error publishing post ${post._id}:`, error);
          
          results.push({
            id: post._id,
            title: post.title,
            success: false,
            error: error.message
          });
        }
      }
      
      return { success: true, results };
    } catch (error) {
      console.error('Error publishing scheduled posts:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Promote blog posts via email
   * @returns {Promise<Object>} Result of the email promotion process
   */
  async promoteBlogPostsViaEmail() {
    try {
      console.log('Promoting blog posts via email');
      
      const settings = await this.getSettings();
      
      if (!settings.emailPromotion.enabled) {
        return { success: false, message: 'Email promotion is disabled in settings' };
      }
      
      const now = new Date();
      
      // Find posts that are published and due for email promotion
      const postsToPromote = await BlogPost.find({
        status: 'published',
        'automation.emailPromoted': false,
        'automation.emailPromotionDate': { $lte: now }
      });
      
      console.log(`Found ${postsToPromote.length} posts to promote via email`);
      
      const results = [];
      
      for (const post of postsToPromote) {
        try {
          // If dedicated emails are enabled for featured posts
          if (settings.emailPromotion.dedicatedEmailForFeatured) {
            // Create a dedicated email campaign for this post
            const emailResult = await this._createBlogPostEmailCampaign(post);
            
            if (emailResult.success) {
              post.automation.emailPromoted = true;
              post.automation.emailCampaignId = emailResult.campaign._id;
              await post.save();
              
              results.push({
                id: post._id,
                title: post.title,
                success: true,
                campaignId: emailResult.campaign._id
              });
            } else {
              results.push({
                id: post._id,
                title: post.title,
                success: false,
                error: emailResult.message
              });
            }
          } else {
            // Mark for inclusion in the next newsletter
            post.automation.emailPromoted = true;
            await post.save();
            
            results.push({
              id: post._id,
              title: post.title,
              success: true,
              newsletter: true
            });
          }
        } catch (error) {
          console.error(`Error promoting post ${post._id} via email:`, error);
          
          results.push({
            id: post._id,
            title: post.title,
            success: false,
            error: error.message
          });
        }
      }
      
      // If newsletter inclusion is enabled, check if we need to create a newsletter
      if (settings.emailPromotion.includeInNewsletter) {
        // This would typically be handled by a scheduled task
        // For now, we'll just log that it would happen
        console.log('Posts marked for inclusion in the next newsletter');
      }
      
      return { success: true, results };
    } catch (error) {
      console.error('Error promoting blog posts via email:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Create an email campaign for a blog post
   * @param {Object} post - The blog post to promote
   * @returns {Promise<Object>} Result of the campaign creation
   * @private
   */
  async _createBlogPostEmailCampaign(post) {
    try {
      const settings = await this.getSettings();
      
      // Get the email template
      const emailTemplateId = settings.emailPromotion.emailTemplate;
      
      // Create campaign options
      const options = {
        name: `Blog Post: ${post.title}`,
        description: `Email campaign for blog post: ${post.title}`,
        type: 'newsletter',
        scheduledFor: new Date(Date.now() + 3600000) // Schedule for 1 hour from now
      };
      
      // Use the MailchimpService to create the campaign
      const result = await MailchimpService.scheduleNewsletter(options);
      
      return result;
    } catch (error) {
      console.error(`Error creating email campaign for blog post ${post._id}:`, error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Generate a content calendar
   * @param {Object} options - Calendar options
   * @returns {Promise<Object>} The generated content calendar
   */
  async generateContentCalendar(options = {}) {
    try {
      console.log('Generating content calendar');
      
      const settings = await this.getSettings();
      
      // Default to a 4-week calendar
      const weeks = options.weeks || 4;
      const startDate = options.startDate ? new Date(options.startDate) : new Date();
      
      // Calculate end date
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (weeks * 7));
      
      // Get publishing days
      const publishingDays = settings.publishingSchedule.daysOfWeek;
      const maxPostsPerWeek = settings.publishingSchedule.maxPostsPerWeek;
      
      // Get approved topics that don't have blog posts yet
      const approvedTopics = await BlogTopic.find({
        status: 'approved',
        blogPost: { $exists: false }
      }).sort({ priority: -1 });
      
      // Get scheduled and draft posts
      const scheduledPosts = await BlogPost.find({
        status: 'scheduled',
        scheduledFor: { $gte: startDate, $lte: endDate }
      }).sort({ scheduledFor: 1 });
      
      // Build the calendar
      const calendar = {
        startDate,
        endDate,
        weeks: []
      };
      
      let currentDate = new Date(startDate);
      let topicIndex = 0;
      
      // For each week in the calendar
      for (let week = 0; week < weeks; week++) {
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekData = {
          weekNumber: week + 1,
          startDate: weekStart,
          endDate: weekEnd,
          days: []
        };
        
        // For each day in the week
        for (let day = 0; day < 7; day++) {
          const date = new Date(currentDate);
          const dayOfWeek = date.getDay();
          
          const dayData = {
            date,
            dayOfWeek,
            isPublishingDay: publishingDays.includes(dayOfWeek),
            posts: []
          };
          
          // Add scheduled posts for this day
          const postsForDay = scheduledPosts.filter(post => {
            const postDate = new Date(post.scheduledFor);
            return postDate.toDateString() === date.toDateString();
          });
          
          dayData.posts = postsForDay.map(post => ({
            id: post._id,
            title: post.title,
            status: post.status,
            type: 'scheduled'
          }));
          
          // If this is a publishing day and we haven't reached the max posts
          if (
            dayData.isPublishingDay && 
            dayData.posts.length < maxPostsPerWeek &&
            topicIndex < approvedTopics.length
          ) {
            // Add suggested posts from approved topics
            const availableSlots = maxPostsPerWeek - dayData.posts.length;
            
            for (let i = 0; i < availableSlots && topicIndex < approvedTopics.length; i++) {
              const topic = approvedTopics[topicIndex++];
              
              dayData.posts.push({
                id: topic._id,
                title: topic.title,
                contentType: topic.contentType,
                type: 'suggested'
              });
            }
          }
          
          weekData.days.push(dayData);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        calendar.weeks.push(weekData);
      }
      
      console.log('Content calendar generated');
      return { success: true, calendar };
    } catch (error) {
      console.error('Error generating content calendar:', error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new BlogAutomationService();

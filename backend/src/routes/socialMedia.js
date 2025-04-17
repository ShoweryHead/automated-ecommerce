const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const SocialMediaPost = require('../models/SocialMediaPost');
const SocialMediaSettings = require('../models/SocialMediaSettings');
const Product = require('../models/Product');
const BlogPost = require('../models/BlogPost');
const { check, validationResult } = require('express-validator');

// Get all social media posts
router.get('/', async (req, res) => {
  try {
    const posts = await SocialMediaPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get social media settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await SocialMediaSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new SocialMediaSettings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update social media settings
router.put('/settings', async (req, res) => {
  try {
    let settings = await SocialMediaSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new SocialMediaSettings();
    }
    
    // Update fields from request body
    const updateFields = [
      'enabled', 'platforms', 'productPosting', 'blogPosting',
      'contentGeneration', 'postingLimits', 'urlShortening', 'utmParameters'
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

// Create a new social media post
router.post('/', [
  check('content.text', 'Post text is required').not().isEmpty(),
  check('relatedTo.type', 'Related content type is required').not().isEmpty(),
  check('platforms', 'At least one platform must be selected').isArray({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    // Create new post
    const newPost = new SocialMediaPost({
      content: req.body.content,
      media: req.body.media || [],
      relatedTo: req.body.relatedTo,
      platforms: req.body.platforms,
      status: req.body.status || 'draft',
      scheduledTime: req.body.scheduledTime,
      automation: req.body.automation || {
        isAutomated: false,
        generatedFrom: 'manual'
      },
      createdBy: req.body.createdBy || 'system',
      lastModifiedBy: req.body.createdBy || 'system'
    });
    
    // Save post
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a specific post
router.get('/:id', async (req, res) => {
  try {
    const post = await SocialMediaPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Populate related content
    if (post.relatedTo.type === 'product' && post.relatedTo.productId) {
      await post.populate('relatedTo.productId');
    } else if (post.relatedTo.type === 'blog' && post.relatedTo.blogPostId) {
      await post.populate('relatedTo.blogPostId');
    }
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Update a post
router.put('/:id', async (req, res) => {
  try {
    const post = await SocialMediaPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Update fields from request body
    const updateFields = [
      'content', 'media', 'relatedTo', 'platforms',
      'status', 'scheduledTime'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });
    
    // Update modification info
    post.lastModifiedBy = req.body.modifiedBy || 'system';
    
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Delete a post
router.delete('/:id', async (req, res) => {
  try {
    const post = await SocialMediaPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    await post.remove();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Auto-generate post for a product
router.post('/generate/product/:productId', async (req, res) => {
  try {
    // Find product
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Get social media settings
    let settings = await SocialMediaSettings.findOne();
    if (!settings) {
      settings = new SocialMediaSettings();
      await settings.save();
    }
    
    // Check if product posting is enabled
    if (!settings.enabled || !settings.productPosting.enabled) {
      return res.status(400).json({ msg: 'Product posting is disabled in settings' });
    }
    
    // Determine which platforms to post to
    const platformsToPost = [];
    Object.keys(settings.productPosting.platforms).forEach(platform => {
      if (settings.productPosting.platforms[platform] && settings.platforms[platform].enabled) {
        platformsToPost.push({
          name: platform,
          status: 'pending'
        });
      }
    });
    
    if (platformsToPost.length === 0) {
      return res.status(400).json({ msg: 'No enabled platforms found for posting' });
    }
    
    // Generate hashtags
    let hashtags = [];
    if (settings.productPosting.hashtagGeneration.enabled) {
      // Add default hashtags
      hashtags = [...settings.productPosting.hashtagGeneration.defaultHashtags];
      
      // Add product category as hashtag
      if (product.category) {
        const categoryHashtag = product.category.replace(/\s+/g, '');
        if (categoryHashtag) {
          hashtags.push(categoryHashtag);
        }
      }
      
      // Add product name as hashtag
      const productNameHashtag = product.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
      if (productNameHashtag) {
        hashtags.push(productNameHashtag);
      }
      
      // Limit number of hashtags
      hashtags = hashtags.slice(0, settings.productPosting.hashtagGeneration.maxHashtags);
    }
    
    // Generate post content for each platform
    const posts = [];
    
    for (const platform of platformsToPost) {
      // Get template for this platform or use default
      const template = settings.productPosting.templates[platform.name] || 
                       settings.productPosting.templates.default;
      
      // Replace template variables
      let postText = template.text
        .replace('{product_name}', product.name)
        .replace('{product_description}', product.description || '')
        .replace('{product_short_description}', product.shortDescription || '')
        .replace('{product_category}', product.category || 'product')
        .replace('{product_use_case}', product.useCase || 'industrial applications');
      
      // Add hashtags
      if (hashtags.length > 0) {
        // Check if the template already includes hashtags
        if (!postText.includes('#')) {
          postText += '\n\n' + hashtags.map(tag => `#${tag}`).join(' ');
        }
      }
      
      // Get call to action
      let callToAction = template.callToAction || settings.productPosting.templates.default.callToAction;
      callToAction = callToAction
        .replace('{product_name}', product.name);
      
      // Create post for this platform
      const post = {
        content: {
          text: postText,
          hashtags,
          callToAction
        },
        media: [],
        relatedTo: {
          type: 'product',
          productId: product._id
        },
        platforms: [platform],
        status: 'draft',
        automation: {
          isAutomated: true,
          generatedFrom: 'product',
          templateUsed: `product_${platform.name}`,
          generationTime: new Date()
        },
        createdBy: 'system'
      };
      
      // Add product images if available
      if (product.images && product.images.length > 0) {
        post.media.push({
          type: 'image',
          url: product.images[0],
          altText: `Image of ${product.name}`,
          caption: product.name
        });
      }
      
      // Determine scheduling
      if (settings.productPosting.scheduling.postImmediately) {
        post.status = 'scheduled';
        post.scheduledTime = new Date();
      } else if (settings.productPosting.scheduling.bestTimeToPost) {
        // For demo purposes, schedule for next hour
        post.status = 'scheduled';
        const scheduledTime = new Date();
        scheduledTime.setHours(scheduledTime.getHours() + 1);
        scheduledTime.setMinutes(0);
        scheduledTime.setSeconds(0);
        post.scheduledTime = scheduledTime;
      } else {
        // Use custom time
        post.status = 'scheduled';
        const scheduledTime = new Date();
        scheduledTime.setHours(settings.productPosting.scheduling.customTime.hour);
        scheduledTime.setMinutes(settings.productPosting.scheduling.customTime.minute);
        scheduledTime.setSeconds(0);
        
        // If the time has already passed today, schedule for tomorrow
        if (scheduledTime < new Date()) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        post.scheduledTime = scheduledTime;
      }
      
      posts.push(post);
    }
    
    // Save all generated posts
    const savedPosts = [];
    for (const postData of posts) {
      const newPost = new SocialMediaPost(postData);
      const savedPost = await newPost.save();
      savedPosts.push(savedPost);
    }
    
    res.json(savedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Auto-generate post for a blog post
router.post('/generate/blog/:blogId', async (req, res) => {
  try {
    // Find blog post
    const blogPost = await BlogPost.findById(req.params.blogId);
    if (!blogPost) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    
    // Get social media settings
    let settings = await SocialMediaSettings.findOne();
    if (!settings) {
      settings = new SocialMediaSettings();
      await settings.save();
    }
    
    // Check if blog posting is enabled
    if (!settings.enabled || !settings.blogPosting.enabled) {
      return res.status(400).json({ msg: 'Blog posting is disabled in settings' });
    }
    
    // Determine which platforms to post to
    const platformsToPost = [];
    Object.keys(settings.blogPosting.platforms).forEach(platform => {
      if (settings.blogPosting.platforms[platform] && settings.platforms[platform].enabled) {
        platformsToPost.push({
          name: platform,
          status: 'pending'
        });
      }
    });
    
    if (platformsToPost.length === 0) {
      return res.status(400).json({ msg: 'No enabled platforms found for posting' });
    }
    
    // Generate hashtags
    let hashtags = [];
    if (settings.blogPosting.hashtagGeneration.enabled) {
      // Add default hashtags
      hashtags = [...settings.blogPosting.hashtagGeneration.defaultHashtags];
      
      // Add blog categories as hashtags
      if (blogPost.categories && blogPost.categories.length > 0) {
        blogPost.categories.forEach(category => {
          const categoryHashtag = category.replace(/\s+/g, '');
          if (categoryHashtag) {
            hashtags.push(categoryHashtag);
          }
        });
      }
      
      // Add blog tags as hashtags
      if (blogPost.tags && blogPost.tags.length > 0) {
        blogPost.tags.forEach(tag => {
          const tagHashtag = tag.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
          if (tagHashtag) {
            hashtags.push(tagHashtag);
          }
        });
      }
      
      // Limit number of hashtags
      hashtags = hashtags.slice(0, settings.blogPosting.hashtagGeneration.maxHashtags);
    }
    
    // Generate post content for each platform
    const posts = [];
    
    for (const platform of platformsToPost) {
      // Get template for this platform or use default
      const template = settings.blogPosting.templates[platform.name] || 
                       settings.blogPosting.templates.default;
      
      // Create excerpt if needed
      const excerpt = blogPost.excerpt || blogPost.content.substring(0, 150) + '...';
      const shortExcerpt = blogPost.content.substring(0, 80) + '...';
      
      // Replace template variables
      let postText = template.text
        .replace('{blog_title}', blogPost.title)
        .replace('{blog_excerpt}', excerpt)
        .replace('{blog_short_excerpt}', shortExcerpt)
        .replace('{blog_topic}', blogPost.categories ? blogPost.categories[0] : 'industry topics');
      
      // Add hashtags
      if (hashtags.length > 0) {
        // Check if the template already includes hashtags
        if (!postText.includes('#')) {
          postText += '\n\n' + hashtags.map(tag => `#${tag}`).join(' ');
        }
      }
      
      // Get call to action
      let callToAction = template.callToAction || settings.blogPosting.templates.default.callToAction;
      
      // Create post for this platform
      const post = {
        content: {
          text: postText,
          hashtags,
          callToAction
        },
        media: [],
        relatedTo: {
          type: 'blog',
          blogPostId: blogPost._id
        },
        platforms: [platform],
        status: 'draft',
        automation: {
          isAutomated: true,
          generatedFrom: 'blog',
          templateUsed: `blog_${platform.name}`,
          generationTime: new Date()
        },
        createdBy: 'system'
      };
      
      // Add blog featured image if available
      if (blogPost.featuredImage) {
        post.media.push({
          type: 'image',
          url: blogPost.featuredImage,
          altText: `Featured image for ${blogPost.title}`,
          caption: blogPost.title
        });
      }
      
      // Determine scheduling
      if (settings.blogPosting.scheduling.postImmediately) {
        post.status = 'scheduled';
        post.scheduledTime = new Date();
      } else if (settings.blogPosting.scheduling.bestTimeToPost) {
        // For demo purposes, schedule for next hour
        post.status = 'scheduled';
        const scheduledTime = new Date();
        scheduledTime.setHours(scheduledTime.getHours() + 1);
        scheduledTime.setMinutes(0);
        scheduledTime.setSeconds(0);
        post.scheduledTime = scheduledTime;
      } else {
        // Use custom time
        post.status = 'scheduled';
        const scheduledTime = new Date();
        scheduledTime.setHours(settings.blogPosting.scheduling.customTime.hour);
        scheduledTime.setMinutes(settings.blogPosting.scheduling.customTime.minute);
        scheduledTime.setSeconds(0);
        
        // If the time has already passed today, schedule for tomorrow
        if (scheduledTime < new Date()) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        post.scheduledTime = scheduledTime;
      }
      
      posts.push(post);
    }
    
    // Save all generated posts
    const savedPosts = [];
    for (const postData of posts) {
      const newPost = new SocialMediaPost(postData);
      const savedPost = await newPost.save();
      savedPosts.push(savedPost);
    }
    
    res.json(savedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Process scheduled posts (for cron job)
router.post('/process', async (req, res) => {
  try {
    const now = new Date();
    
    // Find all scheduled posts due for posting
    const scheduledPosts = await SocialMediaPost.find({
      status: 'scheduled',
      scheduledTime: { $lte: now }
    });
    
    const results = {
      processed: 0,
      failed: 0,
      details: []
    };
    
    // Process each post
    for (const post of scheduledPosts) {
      try {
        // Here you would implement the actual posting logic
        // For each platform in the post.platforms array
        
        // For demonstration, we'll just mark it as posted
        post.status = 'posted';
        
        // Update platform-specific status
        post.platforms.forEach(platform => {
          platform.status = 'posted';
          platform.postedTime = new Date();
          platform.postId = 'demo_post_id_' + Math.random().toString(36).substring(7);
          platform.postUrl = `https://${platform.name}.com/demo/post/${platform.postId}`;
        });
        
        await post.save();
        
        results.processed += 1;
        results.details.push({
          id: post._id,
          platforms: post.platforms.map(p => p.name),
          status: 'posted'
        });
      } catch (error) {
        post.status = 'failed';
        await post.save();
        
        results.failed += 1;
        results.details.push({
          id: post._id,
          platforms: post.platforms.map(p => p.name),
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

const OpenAI = require('openai');
const config = require('../config/config');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

/**
 * Service for generating product content using OpenAI
 */
class ContentGenerationService {
  /**
   * Generate a complete product based on keywords
   * @param {Array} keywords - Array of keywords to use for generation
   * @param {String} categoryName - Name of the product category
   * @returns {Object} Generated product content
   */
  async generateProductContent(keywords, categoryName) {
    try {
      console.log(`Generating product content for keywords: ${keywords.join(', ')}`);
      
      // Generate product title
      const title = await this.generateProductTitle(keywords, categoryName);
      
      // Generate product description
      const description = await this.generateProductDescription(title, keywords, categoryName);
      
      // Generate short description
      const shortDescription = await this.generateShortDescription(description);
      
      // Generate features
      const features = await this.generateProductFeatures(title, keywords, categoryName);
      
      // Generate specifications
      const specifications = await this.generateProductSpecifications(title, keywords, categoryName);
      
      // Generate applications
      const applications = await this.generateProductApplications(title, keywords, categoryName);
      
      // Generate FAQs
      const faqs = await this.generateProductFAQs(title, keywords, categoryName);
      
      // Generate SEO metadata
      const seoData = await this.generateSEOMetadata(title, description, keywords, categoryName);
      
      // Return the complete product content
      return {
        title,
        description,
        shortDescription,
        features,
        specifications,
        applications,
        faqs,
        metaTitle: seoData.metaTitle,
        metaDescription: seoData.metaDescription,
        schemaMarkup: seoData.schemaMarkup
      };
    } catch (error) {
      console.error('Error generating product content:', error);
      throw new Error(`Failed to generate product content: ${error.message}`);
    }
  }

  /**
   * Generate a product title based on keywords
   * @param {Array} keywords - Keywords to use for generation
   * @param {String} categoryName - Category name
   * @returns {String} Generated title
   */
  async generateProductTitle(keywords, categoryName) {
    const prompt = `
      Create a compelling, SEO-optimized product title for a ${categoryName} product.
      
      Keywords: ${keywords.join(', ')}
      
      The title should:
      - Be 60-70 characters long
      - Include the main keyword naturally
      - Be clear and descriptive
      - Appeal to customers looking for industrial coating equipment
      - Not mention any pricing
      
      Return only the title text with no additional commentary.
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 100
    });
    
    return response.choices[0].message.content.trim();
  }

  /**
   * Generate a product description based on title and keywords
   * @param {String} title - Product title
   * @param {Array} keywords - Keywords to use for generation
   * @param {String} categoryName - Category name
   * @returns {String} Generated description
   */
  async generateProductDescription(title, keywords, categoryName) {
    const prompt = `
      Create a detailed, SEO-optimized product description for the following product:
      
      Product Title: ${title}
      Product Category: ${categoryName}
      Keywords: ${keywords.join(', ')}
      
      The description should:
      - Be 400-600 words
      - Include the main keywords naturally throughout the text
      - Describe the product's features, benefits, and applications
      - Use HTML formatting (<p>, <ul>, <li>, <strong>) for better readability
      - Include technical specifications where relevant
      - Not mention any pricing information
      - Focus on quality, reliability, and performance
      - Target industrial and commercial users
      
      Return only the formatted description with no additional commentary.
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    return response.choices[0].message.content.trim();
  }

  /**
   * Generate a short description based on the full description
   * @param {String} fullDescription - Full product description
   * @returns {String} Generated short description
   */
  async generateShortDescription(fullDescription) {
    const prompt = `
      Create a concise summary of the following product description.
      The summary should:
      - Be 150-200 characters long
      - Capture the essence of the product
      - Include key selling points
      - Be compelling and informative
      
      Product Description:
      ${fullDescription}
      
      Return only the short description with no additional commentary.
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });
    
    return response.choices[0].message.content.trim();
  }

  /**
   * Generate product features based on title and keywords
   * @param {String} title - Product title
   * @param {Array} keywords - Keywords to use for generation
   * @param {String} categoryName - Category name
   * @returns {Array} Generated features
   */
  async generateProductFeatures(title, keywords, categoryName) {
    const prompt = `
      Create 4 feature categories with bullet points for the following product:
      
      Product Title: ${title}
      Product Category: ${categoryName}
      Keywords: ${keywords.join(', ')}
      
      Each feature category should:
      - Have a clear, benefit-oriented title
      - Include 2-3 bullet points explaining the feature
      - Focus on different aspects of the product (e.g., performance, design, usability, technology)
      - Include relevant keywords naturally
      
      Format the response as a JSON array with this structure:
      [
        {
          "title": "Feature Category Title",
          "items": ["Bullet point 1", "Bullet point 2", "Bullet point 3"]
        },
        ...
      ]
      
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
      const parsedContent = JSON.parse(content);
      return parsedContent.features || [];
    } catch (error) {
      console.error('Error parsing features JSON:', error);
      return [];
    }
  }

  /**
   * Generate product specifications based on title and keywords
   * @param {String} title - Product title
   * @param {Array} keywords - Keywords to use for generation
   * @param {String} categoryName - Category name
   * @returns {Object} Generated specifications
   */
  async generateProductSpecifications(title, keywords, categoryName) {
    const prompt = `
      Create technical specifications for the following product:
      
      Product Title: ${title}
      Product Category: ${categoryName}
      Keywords: ${keywords.join(', ')}
      
      The specifications should:
      - Include 6-10 relevant technical parameters
      - Be realistic for this type of product
      - Include dimensions, power requirements, capacity, etc. where applicable
      - Use industry-standard terminology
      
      Format the response as a JSON object with specification names as keys and values as values:
      {
        "Dimension": "Value",
        "Weight": "Value",
        ...
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
      const parsedContent = JSON.parse(content);
      return parsedContent.specifications || {};
    } catch (error) {
      console.error('Error parsing specifications JSON:', error);
      return {};
    }
  }

  /**
   * Generate product applications based on title and keywords
   * @param {String} title - Product title
   * @param {Array} keywords - Keywords to use for generation
   * @param {String} categoryName - Category name
   * @returns {Array} Generated applications
   */
  async generateProductApplications(title, keywords, categoryName) {
    const prompt = `
      Create a list of 5-8 industry applications for the following product:
      
      Product Title: ${title}
      Product Category: ${categoryName}
      Keywords: ${keywords.join(', ')}
      
      The applications should:
      - Be specific to industries that would use this type of product
      - Include brief explanations of how the product is used in each application
      - Be realistic and relevant
      
      Format the response as a JSON array of strings:
      ["Application 1", "Application 2", ...]
      
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
      const parsedContent = JSON.parse(content);
      return parsedContent.applications || [];
    } catch (error) {
      console.error('Error parsing applications JSON:', error);
      return [];
    }
  }

  /**
   * Generate product FAQs based on title and keywords
   * @param {String} title - Product title
   * @param {Array} keywords - Keywords to use for generation
   * @param {String} categoryName - Category name
   * @returns {Array} Generated FAQs
   */
  async generateProductFAQs(title, keywords, categoryName) {
    const prompt = `
      Create 5 frequently asked questions (FAQs) with answers for the following product:
      
      Product Title: ${title}
      Product Category: ${categoryName}
      Keywords: ${keywords.join(', ')}
      
      The FAQs should:
      - Address common customer questions about this type of product
      - Include questions about features, benefits, maintenance, etc.
      - Provide clear, informative answers
      - Include relevant keywords naturally
      - Not mention pricing
      
      Format the response as a JSON array with this structure:
      [
        {
          "question": "Question text?",
          "answer": "Answer text."
        },
        ...
      ]
      
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
      const parsedContent = JSON.parse(content);
      return parsedContent.faqs || [];
    } catch (error) {
      console.error('Error parsing FAQs JSON:', error);
      return [];
    }
  }

  /**
   * Generate SEO metadata based on title, description, and keywords
   * @param {String} title - Product title
   * @param {String} description - Product description
   * @param {Array} keywords - Keywords to use for generation
   * @param {String} categoryName - Category name
   * @returns {Object} Generated SEO metadata
   */
  async generateSEOMetadata(title, description, keywords, categoryName) {
    const prompt = `
      Create SEO metadata for the following product:
      
      Product Title: ${title}
      Product Category: ${categoryName}
      Keywords: ${keywords.join(', ')}
      
      Generate:
      1. Meta Title (60-70 characters)
      2. Meta Description (150-160 characters)
      3. JSON-LD Schema Markup for Product
      
      Format the response as a JSON object with this structure:
      {
        "metaTitle": "SEO-optimized title",
        "metaDescription": "SEO-optimized description",
        "schemaMarkup": "JSON-LD schema markup as a string"
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
      console.error('Error parsing SEO metadata JSON:', error);
      return {
        metaTitle: title,
        metaDescription: shortDescription,
        schemaMarkup: ''
      };
    }
  }
}

module.exports = new ContentGenerationService();

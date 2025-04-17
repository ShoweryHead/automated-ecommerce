const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AnalyticsData = require('../models/AnalyticsData');
const AnalyticsSettings = require('../models/AnalyticsSettings');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const BlogPost = require('../models/BlogPost');
const EmailCampaign = require('../models/EmailCampaign');
const SocialMediaPost = require('../models/SocialMediaPost');

// Get analytics settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await AnalyticsSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new AnalyticsSettings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update analytics settings
router.put('/settings', async (req, res) => {
  try {
    let settings = await AnalyticsSettings.findOne();
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = new AnalyticsSettings();
    }
    
    // Update fields from request body
    const updateFields = [
      'enabled', 'reportGeneration', 'dataCollection',
      'reportContent', 'emailDelivery', 'dashboard', 'alerts'
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

// Get analytics data for a specific date range
router.get('/data', async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start date and end date are required' });
    }
    
    // Find analytics data for the specified date range
    const analyticsData = await AnalyticsData.findOne({
      'dateRange.start': new Date(startDate),
      'dateRange.end': new Date(endDate),
      'metadata.reportType': reportType || 'custom'
    });
    
    if (!analyticsData) {
      return res.status(404).json({ msg: 'No analytics data found for the specified date range' });
    }
    
    // Populate references
    await AnalyticsData.populate(analyticsData, [
      { path: 'products.mostViewed.productId' },
      { path: 'products.mostInquired.productId' },
      { path: 'content.blogPerformance.blogId' },
      { path: 'email.campaigns.campaignId' },
      { path: 'socialMedia.postPerformance.postId' }
    ]);
    
    res.json(analyticsData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Generate analytics report for a specific date range
router.post('/generate', async (req, res) => {
  try {
    const { startDate, endDate, reportType } = req.body;
    
    if (!startDate || !endDate || !reportType) {
      return res.status(400).json({ msg: 'Start date, end date, and report type are required' });
    }
    
    // Check if report already exists
    const existingReport = await AnalyticsData.findOne({
      'dateRange.start': new Date(startDate),
      'dateRange.end': new Date(endDate),
      'metadata.reportType': reportType
    });
    
    if (existingReport) {
      return res.status(400).json({ msg: 'Report already exists for this date range and type' });
    }
    
    // Get analytics settings
    let settings = await AnalyticsSettings.findOne();
    if (!settings) {
      settings = new AnalyticsSettings();
      await settings.save();
    }
    
    // In a real implementation, this would collect data from various sources
    // For demonstration, we'll create a sample report with mock data
    
    // Create new analytics data
    const newAnalyticsData = new AnalyticsData({
      dateRange: {
        start: new Date(startDate),
        end: new Date(endDate)
      },
      traffic: {
        totalVisits: Math.floor(Math.random() * 10000) + 1000,
        uniqueVisitors: Math.floor(Math.random() * 5000) + 500,
        pageViews: Math.floor(Math.random() * 30000) + 3000,
        avgSessionDuration: Math.floor(Math.random() * 300) + 60,
        bounceRate: Math.floor(Math.random() * 70) + 10,
        topReferrers: [
          { source: 'google', visits: Math.floor(Math.random() * 5000) + 500 },
          { source: 'facebook', visits: Math.floor(Math.random() * 2000) + 200 },
          { source: 'linkedin', visits: Math.floor(Math.random() * 1000) + 100 }
        ],
        deviceBreakdown: {
          desktop: Math.floor(Math.random() * 60) + 20,
          mobile: Math.floor(Math.random() * 50) + 20,
          tablet: Math.floor(Math.random() * 20) + 5
        },
        geographicData: [
          { country: 'United States', visits: Math.floor(Math.random() * 3000) + 300 },
          { country: 'India', visits: Math.floor(Math.random() * 2000) + 200 },
          { country: 'United Kingdom', visits: Math.floor(Math.random() * 1000) + 100 }
        ]
      },
      metadata: {
        reportType,
        generatedAt: new Date(),
        generatedBy: 'system'
      }
    });
    
    // Get real product data for the report
    const products = await Product.find().limit(10);
    if (products.length > 0) {
      newAnalyticsData.products = {
        mostViewed: products.map((product, index) => ({
          productId: product._id,
          views: Math.floor(Math.random() * 1000) + 100 - (index * 50)
        })),
        mostInquired: products.map((product, index) => ({
          productId: product._id,
          inquiries: Math.floor(Math.random() * 100) + 10 - (index * 5)
        })),
        categoryPerformance: [
          { category: 'Powder Coating Machines', views: Math.floor(Math.random() * 2000) + 200, inquiries: Math.floor(Math.random() * 100) + 10 },
          { category: 'Spray Booths', views: Math.floor(Math.random() * 1500) + 150, inquiries: Math.floor(Math.random() * 80) + 8 },
          { category: 'Conveyor Systems', views: Math.floor(Math.random() * 1000) + 100, inquiries: Math.floor(Math.random() * 60) + 6 }
        ]
      };
    }
    
    // Get real inquiry data for the report
    const inquiryCount = await Inquiry.countDocuments();
    const newInquiries = await Inquiry.countDocuments({ status: 'new' });
    const inProgressInquiries = await Inquiry.countDocuments({ status: 'in_progress' });
    const quotedInquiries = await Inquiry.countDocuments({ status: 'quoted' });
    const convertedInquiries = await Inquiry.countDocuments({ status: 'converted' });
    const closedInquiries = await Inquiry.countDocuments({ status: 'closed' });
    
    newAnalyticsData.inquiries = {
      total: inquiryCount,
      byStatus: {
        new: newInquiries,
        inProgress: inProgressInquiries,
        quoted: quotedInquiries,
        converted: convertedInquiries,
        closed: closedInquiries
      },
      conversionRate: inquiryCount > 0 ? (convertedInquiries / inquiryCount) * 100 : 0,
      avgResponseTime: Math.floor(Math.random() * 24) + 1,
      bySource: [
        { source: 'website', count: Math.floor(Math.random() * 100) + 10 },
        { source: 'email', count: Math.floor(Math.random() * 50) + 5 },
        { source: 'whatsapp', count: Math.floor(Math.random() * 30) + 3 }
      ]
    };
    
    // Get real blog data for the report
    const blogPosts = await BlogPost.find().limit(5);
    if (blogPosts.length > 0) {
      newAnalyticsData.content = {
        blogPerformance: blogPosts.map((blog, index) => ({
          blogId: blog._id,
          views: Math.floor(Math.random() * 500) + 50 - (index * 25),
          avgTimeOnPage: Math.floor(Math.random() * 300) + 60,
          inquiriesGenerated: Math.floor(Math.random() * 20) + 2 - index
        })),
        searchTerms: [
          { term: 'powder coating machine', count: Math.floor(Math.random() * 100) + 10 },
          { term: 'industrial spray booth', count: Math.floor(Math.random() * 80) + 8 },
          { term: 'conveyor system price', count: Math.floor(Math.random() * 60) + 6 }
        ]
      };
    }
    
    // Get real email campaign data for the report
    const emailCampaigns = await EmailCampaign.find().limit(3);
    if (emailCampaigns.length > 0) {
      newAnalyticsData.email = {
        campaigns: emailCampaigns.map((campaign, index) => ({
          campaignId: campaign._id,
          sent: Math.floor(Math.random() * 1000) + 100,
          opened: Math.floor(Math.random() * 500) + 50,
          clicked: Math.floor(Math.random() * 200) + 20,
          inquiriesGenerated: Math.floor(Math.random() * 50) + 5
        })),
        overallOpenRate: Math.floor(Math.random() * 40) + 10,
        overallClickRate: Math.floor(Math.random() * 20) + 5,
        subscriberGrowth: Math.floor(Math.random() * 100) + 10
      };
    }
    
    // Get real social media post data for the report
    const socialMediaPosts = await SocialMediaPost.find().limit(5);
    if (socialMediaPosts.length > 0) {
      newAnalyticsData.socialMedia = {
        postPerformance: socialMediaPosts.map((post, index) => ({
          postId: post._id,
          platform: post.platforms[0]?.name || 'facebook',
          impressions: Math.floor(Math.random() * 2000) + 200 - (index * 100),
          engagements: Math.floor(Math.random() * 500) + 50 - (index * 25),
          clicks: Math.floor(Math.random() * 200) + 20 - (index * 10),
          inquiriesGenerated: Math.floor(Math.random() * 20) + 2 - index
        })),
        platformBreakdown: [
          { platform: 'facebook', traffic: Math.floor(Math.random() * 1000) + 100, inquiries: Math.floor(Math.random() * 50) + 5 },
          { platform: 'instagram', traffic: Math.floor(Math.random() * 800) + 80, inquiries: Math.floor(Math.random() * 40) + 4 },
          { platform: 'linkedin', traffic: Math.floor(Math.random() * 600) + 60, inquiries: Math.floor(Math.random() * 30) + 3 }
        ]
      };
    }
    
    // Add SEO metrics
    newAnalyticsData.seo = {
      organicTraffic: Math.floor(Math.random() * 5000) + 500,
      keywordRankings: [
        { keyword: 'powder coating machine', position: Math.floor(Math.random() * 10) + 1, change: Math.floor(Math.random() * 5) - 2 },
        { keyword: 'industrial spray booth', position: Math.floor(Math.random() * 20) + 1, change: Math.floor(Math.random() * 5) - 2 },
        { keyword: 'conveyor system manufacturer', position: Math.floor(Math.random() * 30) + 1, change: Math.floor(Math.random() * 5) - 2 }
      ],
      topLandingPages: [
        { page: '/', visits: Math.floor(Math.random() * 2000) + 200 },
        { page: '/product-category/powder-coating-machines', visits: Math.floor(Math.random() * 1500) + 150 },
        { page: '/contact', visits: Math.floor(Math.random() * 1000) + 100 }
      ]
    };
    
    // Save the analytics data
    const savedAnalyticsData = await newAnalyticsData.save();
    
    // In a real implementation, this would also send email reports to recipients
    // based on the settings.reportGeneration configuration
    
    res.json(savedAnalyticsData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get dashboard data (summary of recent analytics)
router.get('/dashboard', async (req, res) => {
  try {
    // Get analytics settings for dashboard configuration
    let settings = await AnalyticsSettings.findOne();
    if (!settings) {
      settings = new AnalyticsSettings();
      await settings.save();
    }
    
    // Determine date range based on settings
    const endDate = new Date();
    let startDate = new Date();
    
    switch (settings.dashboard.defaultDateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'last30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'thisMonth':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'lastMonth':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(0); // Last day of previous month
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Find most recent analytics data that covers this period
    const analyticsData = await AnalyticsData.findOne({
      'dateRange.start': { $lte: startDate },
      'dateRange.end': { $gte: endDate }
    }).sort({ 'metadata.generatedAt': -1 });
    
    if (!analyticsData) {
      // If no existing data, generate a summary on the fly
      
      // Get top products by views and inquiries
      const products = await Product.find().limit(settings.reportContent.topProductsCount);
      const topProducts = products.map((product, index) => ({
        id: product._id,
        name: product.name,
        views: Math.floor(Math.random() * 1000) + 100 - (index * 50),
        inquiries: Math.floor(Math.random() * 100) + 10 - (index * 5)
      }));
      
      // Get inquiry metrics
      const totalInquiries = await Inquiry.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const newInquiries = await Inquiry.countDocuments({
        status: 'new',
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const convertedInquiries = await Inquiry.countDocuments({
        status: 'converted',
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      // Get recent inquiries
      const recentInquiries = await Inquiry.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('products.product');
      
      // Create dashboard summary
      const dashboardSummary = {
        dateRange: {
          start: startDate,
          end: endDate
        },
        trafficOverview: {
          totalVisits: Math.floor(Math.random() * 10000) + 1000,
          uniqueVisitors: Math.floor(Math.random() * 5000) + 500,
          pageViews: Math.floor(Math.random() * 30000) + 3000,
          bounceRate: Math.floor(Math.random() * 70) + 10
        },
        topProducts,
        inquiryMetrics: {
          total: totalInquiries,
          new: newInquiries,
          converted: convertedInquiries,
          conversionRate: totalInquiries > 0 ? (convertedInquiries / totalInquiries) * 100 : 0
        },
        recentInquiries: recentInquiries.map(inquiry => ({
          id: inquiry._id,
          customer: inquiry.customer.name,
          date: inquiry.createdAt,
          products: inquiry.products.map(p => p.product.name).join(', '),
          status: inquiry.status
        })),
        geographicData: [
          { country: 'United States', visits: Math.floor(Math.random() * 3000) + 300 },
          { country: 'India', visits: Math.floor(Math.random() * 2000) + 200 },
          { country: 'United Kingdom', visits: Math.floor(Math.random() * 1000) + 100 },
          { country: 'Germany', visits: Math.floor(Math.random() * 800) + 80 },
          { country: 'Canada', visits: Math.floor(Math.random() * 700) + 70 }
        ]
      };
      
      return res.json(dashboardSummary);
    }
    
    // If we have existing analytics data, populate references and return it
    await AnalyticsData.populate(analyticsData, [
      { path: 'products.mostViewed.productId' },
      { path: 'products.mostInquired.productId' }
    ]);
    
    // Transform the data into dashboard format
    const dashboardData = {
      dateRange: analyticsData.dateRange,
      trafficOverview: analyticsData.traffic,
      topProducts: {
        byViews: analyticsData.products.mostViewed.map(item => ({
          id: item.productId._id,
          name: item.productId.name,
          views: item.views
        })),
        byInquiries: analyticsData.products.mostInquired.map(item => ({
          id: item.productId._id,
          name: item.productId.name,
          inquiries: item.inquiries
        }))
      },
      inquiryMetrics: analyticsData.inquiries,
      categoryPerformance: analyticsData.products.categoryPerformance,
      geographicData: analyticsData.traffic.geographicData
    };
    
    res.json(dashboardData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Schedule report generation (for cron job)
router.post('/schedule', async (req, res) => {
  try {
    // Get analytics settings
    let settings = await AnalyticsSettings.findOne();
    if (!settings) {
      settings = new AnalyticsSettings();
      await settings.save();
    }
    
    // Determine which reports to generate based on current time
    const now = new Date();
    const reports = [];
    
    // Check for daily report
    if (settings.reportGeneration.daily.enabled) {
      const [hour, minute] = settings.reportGeneration.daily.time.split(':').map(Number);
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hour, minute, 0, 0);
      
      // If it's time to generate the daily report (within 5 minutes of scheduled time)
      if (Math.abs(now - scheduledTime) < 5 * 60 * 1000) {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        
        reports.push({
          type: 'daily',
          startDate,
          endDate,
          recipients: settings.reportGeneration.daily.recipients
        });
      }
    }
    
    // Check for weekly report
    if (settings.reportGeneration.weekly.enabled) {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[now.getDay()];
      
      if (today === settings.reportGeneration.weekly.day) {
        const [hour, minute] = settings.reportGeneration.weekly.time.split(':').map(Number);
        const scheduledTime = new Date(now);
        scheduledTime.setHours(hour, minute, 0, 0);
        
        // If it's time to generate the weekly report (within 5 minutes of scheduled time)
        if (Math.abs(now - scheduledTime) < 5 * 60 * 1000) {
          const startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(now);
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          
          reports.push({
            type: 'weekly',
            startDate,
            endDate,
            recipients: settings.reportGeneration.weekly.recipients
          });
        }
      }
    }
    
    // Check for monthly report
    if (settings.reportGeneration.monthly.enabled) {
      const today = now.getDate();
      
      if (today === settings.reportGeneration.monthly.dayOfMonth) {
        const [hour, minute] = settings.reportGeneration.monthly.time.split(':').map(Number);
        const scheduledTime = new Date(now);
        scheduledTime.setHours(hour, minute, 0, 0);
        
        // If it's time to generate the monthly report (within 5 minutes of scheduled time)
        if (Math.abs(now - scheduledTime) < 5 * 60 * 1000) {
          const startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(now);
          endDate.setDate(0); // Last day of previous month
          endDate.setHours(23, 59, 59, 999);
          
          reports.push({
            type: 'monthly',
            startDate,
            endDate,
            recipients: settings.reportGeneration.monthly.recipients
          });
        }
      }
    }
    
    // Generate the reports
    const results = {
      scheduled: reports.length,
      generated: 0,
      details: []
    };
    
    for (const report of reports) {
      try {
        // Check if report already exists
        const existingReport = await AnalyticsData.findOne({
          'dateRange.start': report.startDate,
          'dateRange.end': report.endDate,
          'metadata.reportType': report.type
        });
        
        if (!existingReport) {
          // In a real implementation, this would generate the report and send emails
          // For demonstration, we'll just create a placeholder
          const newReport = new AnalyticsData({
            dateRange: {
              start: report.startDate,
              end: report.endDate
            },
            metadata: {
              reportType: report.type,
              generatedAt: new Date(),
              generatedBy: 'system'
            }
          });
          
          await newReport.save();
          
          results.generated += 1;
          results.details.push({
            type: report.type,
            startDate: report.startDate,
            endDate: report.endDate,
            status: 'generated'
          });
        } else {
          results.details.push({
            type: report.type,
            startDate: report.startDate,
            endDate: report.endDate,
            status: 'already exists'
          });
        }
      } catch (error) {
        results.details.push({
          type: report.type,
          startDate: report.startDate,
          endDate: report.endDate,
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

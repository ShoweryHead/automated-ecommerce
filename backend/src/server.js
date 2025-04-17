const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const blogRoutes = require('./routes/blog');
const productGenerationRoutes = require('./routes/productGeneration');
const automationSettingsRoutes = require('./routes/automationSettings');
const seoOptimizationRoutes = require('./routes/seoOptimization');
const emailRoutes = require('./routes/email');
const inventoryRoutes = require('./routes/inventory');
const inquiryRoutes = require('./routes/inquiry');
const socialMediaRoutes = require('./routes/socialMedia');
const analyticsRoutes = require('./routes/analytics');
const imagesRoutes = require('./routes/images');

// Initialize Express app
const app = express();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/automated-ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Define routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/product-generation', productGenerationRoutes);
app.use('/api/automation-settings', automationSettingsRoutes);
app.use('/api/seo', seoOptimizationRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/images', imagesRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ msg: 'Welcome to the Automated E-commerce API' });
});

// Catch-all route to serve the frontend in production
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});

// Define port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

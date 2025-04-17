# Hostinger Deployment Instructions for Automated E-commerce Platform

This document provides step-by-step instructions for deploying your automated e-commerce platform on Hostinger.

## Prerequisites

1. A Hostinger account with a hosting plan that supports:
   - Node.js applications
   - MongoDB database (or you'll need to use MongoDB Atlas)
   - Custom domain setup

2. Your domain name registered and pointed to Hostinger nameservers

3. SSH access to your Hostinger account

## Step 1: Prepare Your Application for Deployment

Before deploying to Hostinger, make sure your application is properly prepared:

1. Create a production build of your Next.js frontend:
   ```bash
   cd /path/to/automated-ecommerce/frontend
   npm run build
   ```

2. Update your environment variables:
   - Create a `.env` file in your backend directory with production values
   - Make sure to set `NODE_ENV=production`
   - Update MongoDB connection string to your production database

## Step 2: Set Up MongoDB

You have two options for MongoDB:

### Option A: Use MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (the free tier is sufficient to start)
3. Set up a database user with password authentication
4. Whitelist your Hostinger server IP address
5. Get your connection string and update it in your `.env` file

### Option B: Use Hostinger's MongoDB (if available)

1. Log in to your Hostinger control panel
2. Navigate to the Databases section
3. Create a new MongoDB database
4. Note the connection details provided by Hostinger
5. Update your `.env` file with these details

## Step 3: Upload Your Files to Hostinger

### Using FTP:

1. Connect to your Hostinger account using an FTP client (like FileZilla)
   - Host: Your Hostinger FTP hostname
   - Username: Your Hostinger username
   - Password: Your Hostinger password
   - Port: 21

2. Upload your backend files to a directory like `public_html/api`
3. Upload your frontend build files to `public_html`

### Using Git (if Hostinger supports Git deployment):

1. Log in to your Hostinger account via SSH
2. Navigate to your web directory:
   ```bash
   cd ~/public_html
   ```
3. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/your-repo.git .
   ```
4. Install dependencies and build the application:
   ```bash
   npm install --production
   cd frontend
   npm install --production
   npm run build
   ```

## Step 4: Configure Node.js on Hostinger

1. Log in to your Hostinger control panel
2. Navigate to the "Website" section
3. Find and click on "Node.js" or "Advanced" settings
4. Enable Node.js support
5. Set the Node.js version to 16.x or higher
6. Configure the application entry point to your backend server file:
   - Entry point: `api/src/server.js`
   - Application URL: Your domain or subdomain

## Step 5: Set Up Environment Variables

1. In your Hostinger control panel, find the section for environment variables
2. Add all the necessary environment variables from your `.env` file:
   - `NODE_ENV=production`
   - `PORT=3000` (or as specified by Hostinger)
   - `MONGO_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_jwt_secret`
   - `FRONTEND_URL=https://yourdomain.com`
   - Add all API keys for third-party services (OpenAI, Mailchimp, etc.)

## Step 6: Configure Domain and SSL

1. In your Hostinger control panel, go to the "Domains" section
2. Point your domain to your Hostinger hosting account if not already done
3. Enable SSL for your domain:
   - Find the SSL section in your control panel
   - Select "Let's Encrypt" for a free SSL certificate
   - Follow the prompts to install the certificate

## Step 7: Start Your Application

1. Log in to your Hostinger account via SSH
2. Navigate to your backend directory:
   ```bash
   cd ~/public_html/api
   ```
3. Install PM2 (process manager for Node.js):
   ```bash
   npm install -g pm2
   ```
4. Start your application with PM2:
   ```bash
   pm2 start src/server.js --name "automated-ecommerce"
   ```
5. Set up PM2 to start on server reboot:
   ```bash
   pm2 startup
   pm2 save
   ```

## Step 8: Configure Nginx (if needed)

If Hostinger uses Nginx as a web server, you may need to configure it to proxy requests to your Node.js application:

1. Create or edit the Nginx configuration file for your domain
2. Add a proxy configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. Restart Nginx:
   ```bash
   sudo service nginx restart
   ```

## Step 9: Set Up Cron Jobs for Automation Features

To ensure your automation features run on schedule, set up cron jobs:

1. Log in to your Hostinger account via SSH
2. Open the crontab editor:
   ```bash
   crontab -e
   ```
3. Add the following cron jobs:
   ```
   # Process product generation queue every hour
   0 * * * * curl -X POST https://yourdomain.com/api/product-generation/process
   
   # Process SEO optimization queue daily at 2 AM
   0 2 * * * curl -X POST https://yourdomain.com/api/seo/process
   
   # Process email campaigns every 15 minutes
   */15 * * * * curl -X POST https://yourdomain.com/api/email/process
   
   # Process inquiry follow-ups every 30 minutes
   */30 * * * * curl -X POST https://yourdomain.com/api/inquiry/followup/process
   
   # Process social media posts every hour
   0 * * * * curl -X POST https://yourdomain.com/api/social-media/process
   
   # Generate analytics reports (weekly on Monday at 1 AM)
   0 1 * * 1 curl -X POST https://yourdomain.com/api/analytics/schedule
   ```

## Step 10: Test Your Deployment

1. Visit your domain in a web browser to ensure the frontend is working
2. Test the API endpoints to ensure the backend is working:
   ```
   https://yourdomain.com/api/products
   ```
3. Test each automation feature through the admin interface
4. Monitor the logs for any errors:
   ```bash
   pm2 logs automated-ecommerce
   ```

## Troubleshooting

### Application Not Starting

1. Check the PM2 logs:
   ```bash
   pm2 logs automated-ecommerce
   ```
2. Verify environment variables are set correctly
3. Ensure MongoDB connection is working

### Database Connection Issues

1. Verify your MongoDB connection string
2. Check if your IP is whitelisted in MongoDB Atlas
3. Test the connection manually:
   ```bash
   mongo "your_connection_string" --eval "db.adminCommand('ping')"
   ```

### Frontend Not Loading

1. Check if the build files are in the correct directory
2. Verify the Nginx configuration is correct
3. Check for any JavaScript errors in the browser console

### Automation Features Not Running

1. Verify the cron jobs are set up correctly:
   ```bash
   crontab -l
   ```
2. Check the logs for any errors in the automation processes
3. Test the endpoints manually using curl or Postman

## Maintenance

### Updating Your Application

1. Pull the latest changes from your repository:
   ```bash
   cd ~/public_html
   git pull
   ```
2. Rebuild the frontend:
   ```bash
   cd frontend
   npm run build
   ```
3. Restart the backend:
   ```bash
   pm2 restart automated-ecommerce
   ```

### Monitoring

1. Use PM2 to monitor your application:
   ```bash
   pm2 monit
   ```
2. Check the logs regularly:
   ```bash
   pm2 logs automated-ecommerce
   ```
3. Set up alerts for any critical errors

## Support

If you encounter any issues with your Hostinger deployment, you can:

1. Contact Hostinger support through their help center
2. Check the Node.js and MongoDB documentation
3. Review the application logs for specific error messages

---

This deployment guide is specifically tailored for Hostinger hosting. Some steps may vary depending on your specific Hostinger plan and their current platform configuration.

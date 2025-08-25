# 🚀 **GitHub + Vercel Deployment Guide**

This guide will walk you through deploying VolleyScore Pro to GitHub and Vercel for a professional, publicly accessible volleyball scoreboard system.

## 📋 **Prerequisites**

- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) 18+ installed
- [GitHub](https://github.com/) account
- [Vercel](https://vercel.com/) account
- [Supabase](https://supabase.com/) account (for database)

## 🎯 **Deployment Overview**

```
GitHub Repository → Vercel Deployment → Supabase Database → Cloudinary Storage
```

## 📁 **Step 1: GitHub Repository Setup**

### **1.1 Create GitHub Repository**
1. Go to [GitHub](https://github.com) and click "New repository"
2. Repository name: `volleyscore-pro`
3. Description: `Professional volleyball scoreboard system with online hosting`
4. Make it **Public** (for free Vercel deployment)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### **1.2 Push Your Code to GitHub**
```bash
# Add your GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/volleyscore-pro.git

# Push to GitHub
git push -u origin main
```

## 🗄️ **Step 2: Set Up Supabase Database**

### **2.1 Create Supabase Project**
1. Go to [Supabase](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Project name: `volleyscore-pro`
5. Database password: Create a strong password
6. Region: Choose closest to your users
7. Click "Create new project"

### **2.2 Get Database Connection String**
1. In your Supabase project, go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. It looks like: `postgresql://postgres:[password]@[host]:5432/postgres`

### **2.3 Run Database Migrations**
```bash
# Install Drizzle CLI globally
npm install -g drizzle-kit

# Generate migration files
npm run db:generate

# Push schema to Supabase
npm run db:push
```

## ☁️ **Step 3: Set Up Cloudinary (Image Storage)**

### **3.1 Create Cloudinary Account**
1. Go to [Cloudinary](https://cloudinary.com) and sign up
2. Get your credentials from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### **3.2 Test Cloudinary Configuration**
```bash
# Set environment variables locally
export CLOUDINARY_CLOUD_NAME=your_cloud_name
export CLOUDINARY_API_KEY=your_api_key
export CLOUDINARY_API_SECRET=your_api_secret

# Test the configuration
npm run dev
```

## 🚀 **Step 4: Deploy to Vercel**

### **4.1 Install Vercel CLI**
```bash
npm install -g vercel
```

### **4.2 Login to Vercel**
```bash
vercel login
```

### **4.3 Deploy Your App**
```bash
# From your project directory
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Select your account
# - Link to existing project: No
# - Project name: volleyscore-pro
# - Directory: ./
# - Override settings: No
```

### **4.4 Configure Environment Variables**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `volleyscore-pro` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```env
# App Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# JWT Authentication
JWT_SECRET=your-super-strong-jwt-secret-at-least-32-characters-long

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
USE_CLOUDINARY=true

# CORS Configuration
CORS_ORIGIN=https://your-domain.vercel.app

# Session Configuration
SESSION_SECRET=your-super-strong-session-secret-at-least-32-characters-long
```

### **4.5 Redeploy with Environment Variables**
```bash
vercel --prod
```

## 🔗 **Step 5: Connect GitHub to Vercel**

### **5.1 Enable GitHub Integration**
1. In Vercel Dashboard, go to **Settings** → **Git**
2. Click **Connect Git Repository**
3. Select your `volleyscore-pro` repository
4. Configure deployment settings:
   - Production Branch: `main`
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### **5.2 Set Up GitHub Secrets**
1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

**To get these values:**
```bash
# Get Vercel token
vercel whoami

# Get project info
vercel project ls
```

## 🧪 **Step 6: Test Your Deployment**

### **6.1 Test Basic Functionality**
1. Visit your Vercel URL: `https://volleyscore-pro.vercel.app`
2. Test user registration
3. Test team creation
4. Test image uploads
5. Test scoreboard functionality

### **6.2 Test Database Connection**
1. Create a new user account
2. Verify data is saved in Supabase
3. Check that data persists between sessions

### **6.3 Test Image Storage**
1. Upload a team logo
2. Verify it's stored in Cloudinary
3. Check that images load correctly

## 🔧 **Step 7: Custom Domain (Optional)**

### **7.1 Add Custom Domain**
1. In Vercel Dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS settings with your domain provider
4. Wait for SSL certificate to be issued

### **7.2 Update Environment Variables**
```env
CORS_ORIGIN=https://yourdomain.com
```

## 📊 **Step 8: Monitor and Maintain**

### **8.1 Vercel Analytics**
- Enable Vercel Analytics in your project
- Monitor performance and user behavior
- Set up alerts for errors

### **8.2 Database Monitoring**
- Use Supabase Dashboard to monitor database performance
- Set up alerts for connection issues
- Monitor storage usage

### **8.3 Image Storage Monitoring**
- Monitor Cloudinary usage and costs
- Set up storage limits and alerts
- Optimize image transformations

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Database Connection Failed**
- Verify `DATABASE_URL` is correct
- Check Supabase project status
- Ensure database is not paused

#### **Image Upload Failed**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper CORS configuration

#### **Authentication Errors**
- Verify `JWT_SECRET` is set and strong
- Check token expiration settings
- Ensure proper environment variables

#### **Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for TypeScript errors

### **Debug Commands**
```bash
# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs

# Redeploy with debug info
vercel --debug

# Check environment variables
vercel env ls
```

## 🎉 **Success!**

After completing these steps, you'll have:

✅ **Professional online scoreboard** accessible from anywhere  
✅ **User accounts** with persistent data storage  
✅ **Cloud image storage** for team logos  
✅ **Automatic deployments** from GitHub  
✅ **Professional hosting** with Vercel  
✅ **Scalable database** with Supabase  

## 🔗 **Your Live App**

- **URL**: `https://volleyscore-pro.vercel.app`
- **GitHub**: `https://github.com/YOUR_USERNAME/volleyscore-pro`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

## 📱 **Next Steps**

1. **Share your app** with volleyball teams and tournaments
2. **Collect feedback** from users
3. **Monitor usage** and performance
4. **Add features** based on user needs
5. **Scale up** as your user base grows

Your volleyball scoreboard is now a professional, cloud-hosted application! 🏐✨

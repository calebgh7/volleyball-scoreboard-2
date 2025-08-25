# 🚀 VolleyScore Pro - Complete Deployment Guide

This guide will walk you through deploying your volleyball scoreboard application with full database persistence and cloud storage.

## 📋 Prerequisites

- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) 18+ installed
- [Vercel CLI](https://vercel.com/cli) installed
- [GitHub](https://github.com/) account
- [Vercel](https://vercel.com/) account
- [Supabase](https://supabase.com/) account (for database)
- [Cloudinary](https://cloudinary.com/) account (for image storage)

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com/) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `volleyball-scoreboard`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 2. Get Database Connection String
1. In your project dashboard, go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 3. Run Database Migrations
1. Install Drizzle CLI: `npm install -g drizzle-kit`
2. Set your database URL:
   ```bash
   export DATABASE_URL="your_supabase_connection_string"
   ```
3. Run migrations:
   ```bash
   npm run db:push
   ```

## ☁️ Cloud Storage Setup (Cloudinary)

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com/) and sign up
2. Verify your email

### 2. Get API Credentials
1. In your dashboard, note down:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## 🔧 Environment Configuration

### 1. Create Environment File
Copy `env.production` to `.env.production` and fill in your values:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Authentication
JWT_SECRET=your_very_long_random_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS Configuration
CORS_ORIGIN=https://volleyball-scoreboard-2.vercel.app

# Feature Flags
USE_CLOUDINARY=true
```

### 2. Generate Secure Secrets
Generate strong JWT and session secrets:

```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Generate session secret (32+ characters)
openssl rand -base64 32
```

## 🚀 Deploy to Vercel

### 1. Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com/)
2. Click "New Project"
3. Import your GitHub repository: `calebgh7/volleyball-scoreboard-2`
4. Click "Import"

### 2. Configure Environment Variables
1. In your Vercel project settings, go to **Environment Variables**
2. Add each variable from your `.env.production` file:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `your_supabase_connection_string`
   - `JWT_SECRET` = `your_generated_jwt_secret`
   - `SESSION_SECRET` = `your_generated_session_secret`
   - `CLOUDINARY_CLOUD_NAME` = `your_cloudinary_cloud_name`
   - `CLOUDINARY_API_KEY` = `your_cloudinary_api_key`
   - `CLOUDINARY_API_SECRET` = `your_cloudinary_api_secret`
   - `CORS_ORIGIN` = `https://volleyball-scoreboard-2.vercel.app`
   - `USE_CLOUDINARY` = `true`

### 3. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at the provided URL

## 🔄 Continuous Deployment

### 1. GitHub Actions (Optional)
The repository includes a GitHub Actions workflow that automatically deploys on push to `main`:

```yaml
name: Deploy Volleyball Scoreboard to Vercel
on:
  push:
    branches: [main]
```

### 2. Manual Deployment
To deploy manually:

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod
```

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-app.vercel.app/api/health
```

### 2. Test Authentication
```bash
# Register a new user
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Test Database
```bash
# Get current match (should work without auth)
curl https://your-app.vercel.app/api/current-match

# Get templates (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-app.vercel.app/api/templates
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
- Check your `DATABASE_URL` is correct
- Ensure Supabase is running
- Verify database password is correct

#### 2. Cloudinary Upload Failed
- Check Cloudinary credentials
- Verify `USE_CLOUDINARY=true`
- Check image file size and format

#### 3. Build Errors
- Ensure all environment variables are set
- Check Node.js version (18+ required)
- Verify all dependencies are installed

#### 4. Authentication Issues
- Check JWT_SECRET is set
- Verify token expiration settings
- Check CORS configuration

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
DEBUG=true
```

## 📊 Monitoring

### 1. Vercel Analytics
- View deployment logs in Vercel dashboard
- Monitor API response times
- Check error rates

### 2. Database Monitoring
- Use Supabase dashboard to monitor queries
- Check connection pool usage
- Monitor storage usage

### 3. Cloud Storage Monitoring
- Check Cloudinary dashboard for upload stats
- Monitor storage usage and bandwidth
- Review transformation usage

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit secrets to Git
- Use Vercel's environment variable encryption
- Rotate secrets regularly

### 2. Database Security
- Use connection pooling
- Implement row-level security (RLS) in Supabase
- Regular backups

### 3. API Security
- Rate limiting (implement in production)
- Input validation
- CORS configuration

## 🚀 Next Steps

### 1. Production Enhancements
- [ ] Add rate limiting
- [ ] Implement monitoring and alerting
- [ ] Set up automated backups
- [ ] Add CDN for static assets

### 2. Feature Additions
- [ ] User roles and permissions
- [ ] Advanced analytics
- [ ] Real-time collaboration
- [ ] Mobile app

### 3. Performance Optimization
- [ ] Database query optimization
- [ ] Image compression and optimization
- [ ] Caching strategies
- [ ] Load balancing

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Supabase database logs
4. Open an issue on GitHub

---

**🎉 Congratulations!** Your volleyball scoreboard is now deployed with full database persistence and cloud storage!

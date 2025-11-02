# Deployment Guide

This guide will walk you through deploying your Christmas Tree ordering application to production with a custom domain.

## Overview

Your application uses:
- **Frontend**: React + Vite (will be deployed to Vercel)
- **Database**: Supabase (already configured and running)
- **Cost**: Free for hosting + $10-15/year for domain name

## Prerequisites

- [ ] Git repository (GitHub, GitLab, or Bitbucket account)
- [ ] Vercel account (sign up free at https://vercel.com)
- [ ] Domain name registrar account (Namecheap, Google Domains, Cloudflare, etc.)

---

## Step 1: Push Your Code to Git

If you haven't already, push your project to a Git repository:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit - ready for deployment"

# Add your remote repository (replace with your actual repository URL)
git remote add origin https://github.com/yourusername/your-repo-name.git

# Push to main branch
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Sign Up and Import Project

1. Go to https://vercel.com and sign up (free account)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect it's a Vite project

### 2.2 Configure Environment Variables

**CRITICAL**: Before deploying, add your environment variables:

1. In the Vercel project configuration, find "Environment Variables" section
2. Add the following variables:

```
VITE_SUPABASE_URL=https://uetnumhugcmbtcqdptmv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVldG51bWh1Z2NtYnRjcWRwdG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjQzOTQsImV4cCI6MjA3NzYwMDM5NH0.ZlK6Vi_UnCjxQozNt6ajbvtiZ_UT4iHXtSz3PlmeJAo
```

3. Set these for "Production", "Preview", and "Development" environments
4. Click "Deploy"

### 2.3 Verify Deployment

After deployment completes (usually 1-2 minutes):
1. Vercel will provide a URL like: `https://your-project-name.vercel.app`
2. Click the URL to test your application
3. Test the complete order flow to ensure everything works

---

## Step 3: Register and Configure Custom Domain

### 3.1 Purchase Domain

Choose a domain registrar and purchase your domain:
- **Namecheap**: https://www.namecheap.com (~$10-15/year)
- **Google Domains**: https://domains.google.com (~$12/year)
- **Cloudflare Registrar**: https://www.cloudflare.com/products/registrar/ (~$9-15/year)

### 3.2 Add Domain to Vercel

1. In your Vercel project dashboard, go to "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your domain name (e.g., `yourtreefarm.com`)
4. Vercel will provide DNS configuration instructions

### 3.3 Configure DNS Records

Go to your domain registrar's DNS settings and add the records provided by Vercel:

**Option A: Using A Records (Recommended)**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto or 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto or 3600
```

**Option B: Using CNAME Records**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: Auto or 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto or 3600
```

### 3.4 Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours to propagate
- Usually completes within 15-30 minutes
- Vercel will show "Valid Configuration" when ready
- SSL certificate is automatically provisioned (free via Let's Encrypt)

---

## Step 4: Configure Supabase for Production

### 4.1 Update Allowed Origins

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `uetnumhugcmbtcqdptmv`
3. Go to "Settings" → "API"
4. Scroll to "Site URL" and add your custom domain
5. Under "Redirect URLs", add:
   - `https://yourdomain.com/*`
   - `https://www.yourdomain.com/*`

### 4.2 Verify Edge Functions

Your project has an Edge Function for order notifications:
- Path: `supabase/functions/send-order-notification`
- Should already be deployed
- Test by placing a test order on your live site

---

## Step 5: Final Testing

Test your deployed application thoroughly:

- [ ] Visit your custom domain (e.g., `https://yourdomain.com`)
- [ ] Test complete order flow from start to finish
- [ ] Verify trees load from database
- [ ] Test adding items to cart
- [ ] Complete a test order
- [ ] Verify order confirmation displays
- [ ] Check admin panel functionality
- [ ] Test on mobile devices
- [ ] Verify email notifications are sent (if configured)

---

## Automatic Deployments

Once set up, any changes you push to your Git repository will automatically deploy:

```bash
# Make changes to your code
git add .
git commit -m "Updated feature X"
git push

# Vercel automatically detects the push and deploys
# Check deployment status at https://vercel.com/dashboard
```

---

## Monitoring and Maintenance

### View Deployments
- Vercel Dashboard: https://vercel.com/dashboard
- See all deployments, logs, and analytics

### View Database
- Supabase Dashboard: https://supabase.com/dashboard
- Monitor database queries, storage, and edge functions

### Costs
- **Vercel Free Tier**: Unlimited deployments, 100 GB bandwidth/month
- **Supabase Free Tier**: 500 MB database, 1 GB file storage, 2 GB bandwidth
- **Domain**: ~$10-15/year
- **Total**: ~$1-2/month

---

## Troubleshooting

### Deployment fails
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly
- Ensure package.json has correct build scripts

### Domain not working
- Verify DNS records are correct
- Wait up to 48 hours for DNS propagation
- Check Vercel domain settings for error messages

### Database connection issues
- Verify environment variables match your .env file
- Check Supabase dashboard for API status
- Verify CORS settings include your domain

### Orders not saving
- Check browser console for errors
- Verify Supabase Row Level Security policies
- Test database connection in Supabase dashboard

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/

---

## Security Notes

- Never commit `.env` file to Git (already in .gitignore)
- Keep your Supabase keys secure
- Regularly update dependencies: `npm update`
- Monitor Supabase for suspicious activity

---

Your application is now live with a professional custom domain!

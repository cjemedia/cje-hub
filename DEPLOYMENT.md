# Deployment Guide - CJE Hub

This guide will help you deploy the CJE Hub application to Vercel.

## Prerequisites

- ✅ GitHub account with your code repository
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ Supabase project set up
- ✅ Resend account with API key

## Step 1: Prepare Your Repository

1. **Ensure your code is committed and pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Verify your build works locally:**
   ```bash
   npm run build
   ```
   ✅ Build completed successfully!

## Step 2: Set Up Vercel Project

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com) and sign in**

2. **Click "Add New Project"**

3. **Import your GitHub repository:**
   - Select your repository from the list
   - If you don't see it, click "Adjust GitHub App Permissions" and grant access

4. **Configure Project Settings:**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

5. **Add Environment Variables:**
   Before deploying, add these environment variables in the Vercel dashboard:
   
   **Required Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_api_key
   ```

   **How to find these values:**
   - **Supabase URL & Anon Key:** 
     - Go to your Supabase project dashboard
     - Navigate to Settings → API
     - Copy "Project URL" and "anon public" key
   
   - **Resend API Key:**
     - Go to [resend.com](https://resend.com)
     - Navigate to API Keys section
     - Create a new API key or copy existing one

6. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   Follow the prompts to:
   - Link to existing project or create new
   - Set up environment variables
   - Deploy

4. **For production deployment:**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables in Vercel

After your first deployment, you can add/update environment variables:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
4. Select environments (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your project for changes to take effect

## Step 4: Verify Deployment

1. **Check deployment status** in Vercel dashboard
2. **Visit your deployed URL** (e.g., `https://your-project.vercel.app`)
3. **Test key functionality:**
   - ✅ Homepage loads
   - ✅ Navigation works
   - ✅ Hub login page accessible
   - ✅ API routes respond correctly

## Step 5: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Build completes without errors
- [ ] Homepage loads successfully
- [ ] Hub login page is accessible
- [ ] Supabase connection works (test login)
- [ ] Email functionality works (test contact form)
- [ ] All routes are accessible
- [ ] Custom domain configured (if applicable)

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Test local build:** `npm run build`
4. **Check for TypeScript errors:** `npm run lint`

### Environment Variables Not Working

1. **Redeploy** after adding environment variables
2. **Verify variable names** match exactly (case-sensitive)
3. **Check** that variables are enabled for the correct environment (Production/Preview/Development)

### Supabase Connection Issues

1. **Verify** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
2. **Check** Supabase project is active
3. **Verify** CORS settings in Supabase allow your Vercel domain

### Email Not Working

1. **Verify** `RESEND_API_KEY` is set correctly
2. **Check** Resend dashboard for API usage and errors
3. **Verify** sender email domain is verified in Resend

## Continuous Deployment

Vercel automatically deploys when you push to:
- **`main` branch** → Production
- **Other branches** → Preview deployments

To trigger a manual redeploy:
1. Go to Vercel dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Click **⋯** on any deployment → **Redeploy**

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)

---

**Need Help?** Check the build logs in Vercel dashboard or review the error messages for specific issues.


# Deploy Now - Step by Step

## Quick Deployment Steps

### Step 1: Go to Vercel Dashboard
1. Open [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sign in if needed

### Step 2: Check if Project Exists
- Look for a project named **"cje-hub"** or **"CJEHub"**
- If you see it, click on it and skip to Step 4
- If you DON'T see it, continue to Step 3

### Step 3: Create New Project (if needed)
1. Click **"Add New"** → **"Project"**
2. Find your GitHub repository: **cje-hub** or **cje-media/cje-hub**
3. Click **"Import"**
4. **Project Name:** `cje-hub` (should auto-fill)
5. **Framework Preset:** Next.js (should auto-detect)
6. **Root Directory:** `./` (default)
7. **Build Command:** `npm run build` (default)
8. **Output Directory:** `.next` (default)

### Step 4: Add Environment Variables (CRITICAL!)
**Before clicking Deploy, add these:**

1. In the project setup page, scroll to **"Environment Variables"**
2. Click **"Add"** for each variable:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `your_supabase_project_url` (from Supabase dashboard)
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `your_supabase_anon_key` (from Supabase dashboard)
   - Environments: ✅ Production ✅ Preview ✅ Development

   **Variable 3:**
   - Name: `RESEND_API_KEY`
   - Value: `your_resend_api_key` (from Resend dashboard)
   - Environments: ✅ Production ✅ Preview ✅ Development

### Step 5: Deploy!
1. Click **"Deploy"** button
2. Wait for build to complete (2-5 minutes)
3. You'll see a success message with your URL

### Step 6: Verify
- Click on the deployment
- Visit your live URL (e.g., `https://cje-hub.vercel.app`)
- Test the homepage
- Test `/hub/login`

---

## If Project Already Exists

### Check Deployment Status
1. Click on **"cje-hub"** project
2. Go to **"Deployments"** tab
3. Check the latest deployment:
   - ✅ **Ready** = Success!
   - ⏳ **Building** = Wait for it
   - ❌ **Error** = Check logs

### Add/Update Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add the 3 variables listed above (if missing)
3. Click **"Redeploy"** on latest deployment

### View Build Logs
1. Click on a deployment
2. Click **"View Build Logs"** or **"View Function Logs"**
3. Look for errors (usually red text)

---

## Common Issues

### "Build Failed"
- Check build logs for specific error
- Usually means missing environment variables
- Or TypeScript/build errors

### "Missing Supabase variables"
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Make sure they're enabled for Production

### "Site loads but login doesn't work"
- Check browser console for errors
- Verify Supabase environment variables are correct
- Check Supabase project is active

---

## Quick Links
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Resend Dashboard](https://resend.com/api-keys)

---

**Need the actual values for environment variables?**
- Check your `.env.local` file (if you have one locally)
- Or get them from:
  - Supabase: Settings → API
  - Resend: API Keys section


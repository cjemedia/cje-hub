# Quick Start Checklist

## ✅ What You've Done
- [x] Set up Supabase
- [x] Set up GitHub
- [x] Set up Resend

## 🔧 What You Need to Do Next

### 1. Create Environment Variables File

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
```

**Where to find these:**
- **Supabase URL & Key**: Supabase Dashboard → Settings → API
- **Resend Key**: Resend Dashboard → API Keys

### 2. Run Database Schema

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the **entire contents** of `supabase/schema.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### 3. Install Dependencies & Test Locally

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

### 4. Create Your First Client User

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter email and password
4. Uncheck "Auto Confirm User" if you want to send confirmation email
5. Click **Create User**

**Option B: Enable Email Signup**
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider
3. Users can sign up at `/hub/login` (but you'll need to add a signup link)

**After creating a user:**
- The user needs to log in once to create their client record
- Or manually create a client record in the `clients` table with their user ID

### 5. Deploy to Vercel

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click **Add New** → **Project**
   - Import your GitHub repository
   - Click **Import**

3. **Add Environment Variables in Vercel**:
   - In project settings, go to **Environment Variables**
   - Add all three variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `RESEND_API_KEY`
   - Make sure to add them for **Production**, **Preview**, and **Development**

4. **Deploy**:
   - Click **Deploy**
   - Wait for build to complete
   - Your site will be live at `your-project.vercel.app`

### 6. Set Up Custom Domain (Optional)

1. In Vercel project settings → **Domains**
2. Add `ciarajevans.com`
3. Follow DNS instructions
4. For subdomain `agency.ciarajevans.com`, add it as a separate domain

---

## 🔐 Login URLs

### Development (Local)
- **Main Site**: http://localhost:3000
- **Login Page**: http://localhost:3000/hub/login
- **Dashboard**: http://localhost:3000/hub/dashboard (redirects to login if not authenticated)

### Production (After Vercel Deployment)
- **Main Site**: `https://ciarajevans.com` (or your Vercel URL)
- **Login Page**: `https://ciarajevans.com/hub/login`
- **Dashboard**: `https://ciarajevans.com/hub/dashboard`

### Subdomain (If Configured)
- **Client Portal**: `https://agency.ciarajevans.com`
- **Login**: `https://agency.ciarajevans.com/hub/login`

---

## 🚨 Common Issues & Solutions

### "Invalid API key" or Supabase connection errors
- ✅ Check `.env.local` file exists and has correct values
- ✅ Restart dev server after adding env variables
- ✅ In Vercel, make sure env variables are added for all environments

### "Table doesn't exist" errors
- ✅ Make sure you ran the SQL schema in Supabase
- ✅ Check Supabase SQL Editor → check if tables exist

### "Unauthorized" when logging in
- ✅ User exists in Supabase Auth
- ✅ User has a corresponding record in `clients` table
- ✅ Check Supabase Dashboard → Authentication → Users

### Can't log in / "User not found"
- ✅ Create user in Supabase Auth first
- ✅ After first login, manually create client record OR
- ✅ Add a trigger to auto-create client record (see below)

---

## 🔧 Optional: Auto-Create Client Records

To automatically create a client record when a user signs up, add this to Supabase:

1. Go to **SQL Editor** → **New Query**
2. Paste this:

```sql
-- Function to create client record on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clients (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

3. Click **Run**

Now when users sign up, they'll automatically get a client record!

---

## ✅ Final Checklist

- [ ] `.env.local` file created with all keys
- [ ] Database schema executed in Supabase
- [ ] Dependencies installed (`npm install`)
- [ ] Site runs locally (`npm run dev`)
- [ ] First user created in Supabase Auth
- [ ] Can log in at `/hub/login`
- [ ] Code pushed to GitHub
- [ ] Vercel project created and connected
- [ ] Environment variables added in Vercel
- [ ] Site deployed and live
- [ ] Custom domain configured (if applicable)

---

## 🎉 You're Done!

Once everything is set up:
- Main site: Showcase services and booking
- Client portal: Secure login for clients
- Email notifications: Working via Resend
- Database: All tables and security in place

Need help? Check the error messages in:
- Browser console (F12)
- Vercel deployment logs
- Supabase logs


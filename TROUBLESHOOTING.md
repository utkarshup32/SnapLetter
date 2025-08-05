# Troubleshooting Guide

## Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Inngest Configuration
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### Getting Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### Getting Your Inngest Signing Key

1. Go to [Inngest Dashboard](https://cloud.inngest.com/)
2. Select your app
3. Go to Settings → API Keys
4. Copy the Signing Key

## Database Setup

### Create Tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  categories TEXT[] NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly')),
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent'
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own newsletters" ON newsletters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own newsletters" ON newsletters
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Common Issues and Solutions

### 1. "Failed to save preferences" Error

**Symptoms:**
- Error message when trying to save preferences
- Console shows database connection errors

**Solutions:**
1. Check that your Supabase environment variables are correct
2. Verify the database tables exist
3. Ensure RLS policies are properly configured
4. Check that the user is authenticated

### 2. Inngest API Error: 401 Event key not found

**Symptoms:**
- Console shows "Inngest API Error: 401 Event key not found"
- Newsletter scheduling fails
- Inngest functions don't run

**Solutions:**

#### For Local Development:
1. **Start the Inngest Dev Server:**
   ```bash
   npx inngest dev
   ```
   This should start the dev server on `http://localhost:8288`

2. **Check Inngest Dev Server Status:**
   - Visit `http://localhost:8288` in your browser
   - You should see the Inngest dashboard

3. **Verify Environment Variables:**
   - Make sure `INNGEST_SIGNING_KEY` is set in your `.env.local`
   - For local development, you can use any value (e.g., "dev")

4. **Test Inngest Configuration:**
   ```bash
   # Test the API endpoint
   curl -X GET http://localhost:3000/api/test-inngest
   
   # Send a test event
   curl -X POST http://localhost:3000/api/test-inngest
   ```

#### For Production:
1. **Get a Valid Inngest Signing Key:**
   - Go to [Inngest Cloud Dashboard](https://cloud.inngest.com/)
   - Create a new app or select existing app
   - Go to Settings → API Keys
   - Copy the Signing Key

2. **Set Environment Variables:**
   - Add `INNGEST_SIGNING_KEY=your_actual_key` to your production environment
   - Make sure the key is valid and not expired

3. **Deploy Functions:**
   ```bash
   npx inngest deploy
   ```

### 3. Inngest Dev Server Won't Start

**Symptoms:**
- `npx inngest dev` fails or doesn't start
- Error messages about missing dependencies

**Solutions:**
1. **Reinstall Inngest:**
   ```bash
   npm uninstall inngest
   npm install inngest@latest
   ```

2. **Clear Node Modules:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node Version:**
   ```bash
   node --version
   # Should be 18+ for Inngest
   ```

4. **Alternative Installation:**
   ```bash
   npx create-inngest@latest
   ```

### 4. API Routes Returning HTML Instead of JSON

**Symptoms:**
- API endpoints return HTML instead of JSON
- 404 errors on API routes

**Solutions:**
1. **Restart Development Server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Check File Structure:**
   - Ensure API files are in the correct location: `app/api/route-name/route.ts`
   - Verify file names are correct

3. **Clear Next.js Cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

### 5. Authentication Issues

**Symptoms:**
- Users can't sign in
- "Authentication required" errors

**Solutions:**
1. **Check Supabase Auth Settings:**
   - Go to Supabase Dashboard → Authentication → Settings
   - Verify email confirmations are configured correctly
   - Check redirect URLs

2. **Verify Environment Variables:**
   - Ensure Supabase URL and keys are correct
   - Check for typos in variable names

## Testing Your Setup

### 1. Test Database Connection
```bash
# Check if you can connect to Supabase
curl -X GET http://localhost:3000/api/test
```

### 2. Test Inngest Configuration
```bash
# Check Inngest status
curl -X GET http://localhost:3000/api/test-inngest

# Send test event
curl -X POST http://localhost:3000/api/test-inngest
```

### 3. Test User Preferences
1. Sign in to your app
2. Go to `/select` page
3. Choose categories and frequency
4. Save preferences
5. Check dashboard for saved preferences

## Debugging Tips

### 1. Check Console Logs
- Open browser developer tools
- Look for error messages in the console
- Check network tab for failed requests

### 2. Check Server Logs
- Monitor terminal output when running `npm run dev`
- Look for error messages and warnings

### 3. Use Browser Network Tab
- Check API request/response details
- Verify correct headers and data

### 4. Test Individual Components
- Test each API endpoint separately
- Verify database connections
- Check Inngest configuration step by step

## Getting Help

If you're still experiencing issues:

1. **Check the console logs** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Test each component** individually
4. **Check the Inngest dashboard** for function status
5. **Review the Supabase logs** for database issues

## Quick Fix for Inngest 401 Error

If you're getting the 401 error and want a quick fix:

1. **For Development:**
   ```bash
   # Start Inngest dev server
   npx inngest dev
   
   # In another terminal, start your app
   npm run dev
   ```

2. **For Production:**
   - Get a valid signing key from Inngest Cloud
   - Set it in your environment variables
   - Deploy your functions: `npx inngest deploy`

The app will now handle Inngest errors gracefully and continue working even if Inngest is not properly configured. 
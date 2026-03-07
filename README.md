# Rock Point Coaching — Training Portal

## Deploy to Vercel (5 minutes)

### Step 1 — Upload to Vercel
1. Go to https://vercel.com and sign up (free, use Google or GitHub)
2. Click **Add New → Project**
3. Click **"Import from your computer"** or drag this folder in
   - If asked, select **Vite** as the framework preset
   - Leave all other settings as default
4. Click **Deploy**
5. Vercel gives you a URL like `rockpoint-coaching.vercel.app` — your app is live!

### Step 2 — Add custom domain (app.rockpointcoaching.com)
**In Vercel:**
1. Go to your project → **Settings → Domains**
2. Type `app.rockpointcoaching.com` and click Add
3. Vercel will show you a CNAME value to add — copy it

**In Wix:**
1. Go to your Wix dashboard → **Domains → Manage DNS Records**
2. Click **Add Record → CNAME**
3. Name/Host: `app`
4. Value/Points to: paste the value Vercel gave you
5. Save — DNS propagates in 5–30 minutes

That's it. Athletes go to **app.rockpointcoaching.com**.

---

## First time setup
1. Open the app
2. Go to the **Coach** tab on the login screen
3. Click **Enter Coach View** (no password needed the first time)
4. Click the **🔑** button in the header
5. Set your coach password and passwords for each athlete
6. Click **Save**
7. Hit **↓ Export** and save your backup somewhere safe

## Sharing with athletes
- URL: `app.rockpointcoaching.com`
- Each athlete selects their name and enters the password you set for them
- You control all passwords from the 🔑 menu in Coach View

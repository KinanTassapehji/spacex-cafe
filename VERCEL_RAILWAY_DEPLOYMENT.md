# Deploy to Vercel (Frontend) + Railway (Backend)

## Overview
This guide migrates your SpaceX Gaming Cafe from Render to a more reliable stack:
- **Frontend**: Vercel (free tier, excellent performance)
- **Backend**: Railway (generous free tier, better Node.js support)
- **Database**: MongoDB Atlas (unchanged)

## Prerequisites
1. GitHub account
2. Vercel account (free)
3. Railway account (free)
4. MongoDB Atlas account (free tier)

---

## Step 1: Prepare Your Code

### Security Fixes Applied
✅ Rate limiting added
✅ Password hashing strengthened
✅ Input validation improved
✅ JWT security enhanced

### Files Created/Modified
- `vercel.json` - Vercel configuration
- `client/vercel.json` - Frontend routing
- `server/railway.json` - Railway configuration
- `server/Dockerfile` - Docker containerization
- `server/healthcheck.js` - Health monitoring

---

## Step 2: Deploy Backend to Railway

### Railway Dashboard Deployment (Recommended)

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Click "New Project"** → **"Deploy from GitHub repo"**
3. **Connect your GitHub repository**
4. **Railway will auto-detect** your `server/railway.json` configuration
5. **Go to "Variables" tab** and add environment variables:
   ```
   NODE_ENV = production
   MONGODB_URI = mongodb+srv://spacex:SpaceX2025@cluster0.4vphdsv.mongodb.net/sales_management?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET = c38c1abca578abc9f4fddcf41f12b2e9f0911073e2fabb2b9898ff18f95dd318387b9b7ef89f1b08ba288825b937eb448e8bef0c0cccbb47e4174fed6fbfccd0
   PORT = 5000
   BCRYPT_ROUNDS = 12
   ```
6. **Railway will build and deploy automatically**
7. **Get your backend URL** from Railway dashboard → Your project → Settings → Domains

---

## Step 3: Deploy Frontend to Vercel

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variable for API URL
vercel env add REACT_APP_API_BASE
# Enter: https://your-railway-backend-url.up.railway.app/api
```

### Option B: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project" → "Import Git Repository"
3. Connect your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variable:
   - **Name**: `REACT_APP_API_BASE`
   - **Value**: `https://your-railway-backend-url.up.railway.app/api`

6. Click "Deploy"

### Update API URLs

Before deploying, update the Vercel configuration files:

1. Edit `vercel.json`:
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-railway-backend-url.up.railway.app/api/$1"
    }
  ]
}
```

2. Edit `client/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-railway-backend-url.up.railway.app/api/$1"
    }
  ]
}
```

---

## Step 4: Update Client API Configuration

Update `client/src/App.js` to use environment variable:

```javascript
// Change this line:
const API_BASE = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

// To this:
const API_BASE = process.env.REACT_APP_API_BASE || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');
```

---

## Step 5: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try registering a new user
3. Login and test all features
4. Check that sessions, inventory, and reports work

---

## Platform Comparison

| Feature | Render (Old) | Vercel + Railway (New) |
|---------|-------------|----------------------|
| Frontend Performance | Good | Excellent (CDN) |
| Backend Reliability | Poor | Excellent |
| Free Tier Limits | 750h/month | 512MB RAM, 1GB storage |
| Cold Starts | 30-60s | ~1-2s (Railway) |
| Database | External | External (Atlas) |
| Scaling | Limited | Better |
| Support | Basic | Good |

---

## Troubleshooting

### Railway Issues
- Check Railway logs: `railway logs`
- Verify environment variables are set correctly
- Ensure MongoDB Atlas allows Railway's IP ranges

### Vercel Issues
- Check Vercel function logs in dashboard
- Verify API URL is correct in environment variables
- Clear Vercel cache if needed: `vercel --prod`

### Common Issues
- **CORS errors**: Update CORS origins in Railway environment
- **API timeouts**: Railway free tier has request limits
- **Build failures**: Check Node.js version compatibility

---

## Cost Comparison

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Render | 750h/month | $7/month |
| Vercel | 100GB bandwidth | $20/month |
| Railway | 512MB RAM | $10/month |
| MongoDB Atlas | 512MB | $9/month |

**Total Free Tier**: ~$0/month (vs Render's limitations)

---

## Migration Checklist

- [ ] MongoDB Atlas connection working
- [ ] Railway backend deployed successfully
- [ ] Vercel frontend deployed successfully
- [ ] Environment variables configured
- [ ] API URLs updated in frontend
- [ ] User registration/login working
- [ ] All features tested (sessions, inventory, reports)
- [ ] Domain configured (optional)

---

## Performance Improvements

1. **Faster Cold Starts**: Railway has better cold start performance
2. **Global CDN**: Vercel serves frontend from edge locations
3. **Better Caching**: Vercel automatically caches static assets
4. **Health Checks**: Railway monitors app health continuously

---

## Rollback Plan

If issues occur:
1. Keep Render deployment active temporarily
2. Test thoroughly on new platforms
3. Update DNS/domain when confident
4. Decommission Render after successful migration

---

**Your app will be more reliable and performant on Vercel + Railway! 🚀**
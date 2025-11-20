# Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Frontend (Vercel)
1. **Push to GitHub** (we'll do this next)
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `EMS-FULLSTACK-NET` repository

3. **Configure Project:**
   - Framework: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Set Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   NODE_ENV=production
   ```

5. **Deploy:** Click "Deploy" and wait for build completion

### 2. Backend (.NET API)

#### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" > "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect .NET and deploy
6. Set environment variables:
   ```
   ConnectionStrings__DefaultConnection=your_supabase_connection
   JwtSettings__Key=your_jwt_secret
   ```

#### Option B: Render
1. Go to [render.com](https://render.com)
2. Connect GitHub account
3. Create "New Web Service"
4. Connect your repository
5. Configure:
   - Build Command: `dotnet publish -c Release -o out`
   - Start Command: `dotnet out/EmployeeMvp.dll`

#### Option C: Azure App Service
1. Install Azure CLI: `az login`
2. Create resource group and app service
3. Deploy with: `az webapp up --name your-app-name`

### 3. Database (Already Set Up)
Your Supabase database is already configured and ready to use.

## 🔧 Post-Deployment Configuration

### Update Frontend Environment
After backend deployment, update Vercel environment variable:
```
NEXT_PUBLIC_API_URL=https://your-deployed-backend-url.com
```

### Test the Deployment
1. Visit your Vercel URL
2. Try logging in with demo credentials:
   - Admin: demo.admin@company.com / Admin123!
   - Manager: demo.manager@company.com / Manager123!
   - Employee: demo.employee@company.com / Employee123!

## 🐛 Troubleshooting

### Common Issues:
1. **CORS Errors:** Update backend CORS policy to include your Vercel domain
2. **Environment Variables:** Double-check all environment variables are set correctly
3. **Build Errors:** Check Node.js version compatibility (use Node 18+)
4. **API Connection:** Verify backend URL is accessible and HTTPS

### Logs:
- **Vercel:** Check Functions tab for deployment logs
- **Railway:** View logs in Railway dashboard
- **Render:** Check logs in Render dashboard

## 📊 Performance Optimization

### Frontend:
- Images are optimized automatically by Next.js
- Static assets are cached by Vercel CDN
- API calls are proxied through Next.js

### Backend:
- Enable compression in .NET API
- Use connection pooling for database
- Implement caching strategies

## 🔒 Security Checklist

- ✅ HTTPS enabled (automatic on Vercel/Railway)
- ✅ Environment variables secured
- ✅ JWT secrets are strong and unique
- ✅ CORS configured properly
- ✅ Security headers implemented

---

**Need help?** Check the troubleshooting section or create an issue in the repository.
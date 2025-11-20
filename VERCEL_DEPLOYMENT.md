# 🚀 Vercel Deployment Guide

## Overview
Deploy your Employee Management System frontend to Vercel with automatic CI/CD.

---

## 📋 Prerequisites

1. **GitHub/GitLab/Bitbucket Account**
   - Push your code to a repository

2. **Vercel Account**
   - Sign up at: https://vercel.com/signup
   - Free tier available

3. **Backend API Deployed**
   - Your .NET backend must be hosted (Azure, AWS, Railway, etc.)
   - You'll need the API URL

---

## 🎯 Quick Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push Code to GitHub**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit - Employee Management System"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Project"
   - Select your repository
   - Configure project:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build` (auto-detected)
     - **Output Directory**: `.next` (auto-detected)

3. **Add Environment Variables**
   In Vercel project settings:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-backend-api.com/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at: `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```

3. **Navigate to Frontend**
   ```powershell
   cd frontend
   ```

4. **Deploy**
   ```powershell
   # First deployment
   vercel
   
   # Follow prompts:
   # - Set up and deploy? Yes
   # - Which scope? (select your account)
   # - Link to existing project? No
   # - Project name? employee-management-system
   # - Directory? ./
   # - Override settings? No
   ```

5. **Add Environment Variable**
   ```powershell
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter your backend API URL when prompted
   ```

6. **Deploy to Production**
   ```powershell
   vercel --prod
   ```

---

## 🔧 Configuration

### Frontend Configuration

Your `next.config.js` already has the correct settings:
```javascript
const nextConfig = {
  output: 'standalone', // ✅ Required for Docker (optional for Vercel)
  experimental: {
    outputFileTracingRoot: undefined,
  },
}
```

### Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.com/api` | Production, Preview, Development |

**Note**: `NEXT_PUBLIC_` prefix makes it available in the browser.

---

## 🖥️ Backend Deployment Options

Your .NET backend needs to be hosted. Here are options:

### 1. **Azure App Service** (Recommended for .NET)
```powershell
# Install Azure CLI
winget install Microsoft.AzureCLI

# Login
az login

# Create resources
az group create --name ems-rg --location eastus
az appservice plan create --name ems-plan --resource-group ems-rg --sku B1 --is-linux
az webapp create --name ems-backend --resource-group ems-rg --plan ems-plan --runtime "DOTNETCORE:8.0"

# Deploy
cd C:\Users\joaxp\OneDrive\Documents\EMS
dotnet publish -c Release
az webapp deployment source config-zip --resource-group ems-rg --name ems-backend --src publish.zip

# Your API URL: https://ems-backend.azurewebsites.net
```

### 2. **Railway** (Easy, Free Tier)
- Go to https://railway.app
- Connect GitHub repo
- Select backend folder
- Railway auto-detects .NET 8
- Deploy (5 minutes)
- Get URL: `https://your-app.up.railway.app`

### 3. **Render** (Free Tier Available)
- Go to https://render.com
- New → Web Service
- Connect repository
- Build Command: `dotnet publish -c Release -o out`
- Start Command: `dotnet out/EmployeeMvp.dll`
- Free tier available

### 4. **Fly.io** (Great for .NET)
```powershell
# Install Fly CLI
iwr https://fly.io/install.ps1 -useb | iex

# Login
fly auth login

# Launch app
cd C:\Users\joaxp\OneDrive\Documents\EMS
fly launch

# Deploy
fly deploy
```

---

## 🔐 Environment Setup

### Backend Environment Variables

Configure on your hosting platform:

```ini
# JWT Configuration
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_ISSUER=EmployeeManagementSystem
JWT_AUDIENCE=EmployeeManagementSystem
JWT_EXPIRATION_MINUTES=1440

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Redis (if using)
REDIS_CONNECTION_STRING=your-redis-url

# CORS Origins (add your Vercel URL)
CORS_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

### Update Backend CORS

Add your Vercel URL to `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "https://your-app.vercel.app",  // Add this
                "https://your-custom-domain.com") // Add custom domain
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

---

## 🌐 Custom Domain

### Add Domain to Vercel

1. Go to Project Settings → Domains
2. Add your domain: `ems.yourdomain.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: ems
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-60 minutes)
5. SSL certificate auto-generated

### Add Domain to Backend CORS

Update backend to allow your custom domain.

---

## 🔄 Automatic Deployments

### Git-based Deployment

Vercel automatically deploys on:
- **Push to `main`** → Production deployment
- **Pull Requests** → Preview deployments
- **Push to other branches** → Preview deployments

### Deployment URL Structure

```
Production:  https://your-project.vercel.app
Preview:     https://your-project-git-branch-name.vercel.app
Custom:      https://your-domain.com
```

---

## 🧪 Test Before Production

### Preview Deployments

1. Create a new branch:
   ```powershell
   git checkout -b feature/test-deployment
   git push origin feature/test-deployment
   ```

2. Open PR on GitHub
3. Vercel creates preview deployment
4. Test at: `https://your-project-git-feature-test-deployment.vercel.app`
5. Merge when ready

### Local Testing with Production API

```powershell
cd frontend

# Create .env.local
echo "NEXT_PUBLIC_API_URL=https://your-backend-api.com/api" > .env.local

# Run locally
npm run dev
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Enable in Project Settings → Analytics
2. View real-time traffic
3. Core Web Vitals tracking

### Vercel Logs

```powershell
# View runtime logs
vercel logs
vercel logs --follow

# View deployment logs
vercel logs [deployment-url]
```

---

## 🐛 Troubleshooting

### Build Fails

**Error**: `Module not found`
```powershell
# Clear node_modules and reinstall
cd frontend
rm -r node_modules
rm package-lock.json
npm install
```

**Error**: `Environment variable not found`
- Check Vercel dashboard → Settings → Environment Variables
- Ensure `NEXT_PUBLIC_API_URL` is set for all environments

### API Connection Issues

**Error**: `Failed to fetch` or CORS errors
1. Verify backend is running
2. Check CORS configuration includes Vercel URL
3. Ensure `NEXT_PUBLIC_API_URL` is correct (with `/api` suffix)

### Deployment URL

**Issue**: Can't access deployment
```powershell
# Get deployment URL
vercel ls

# Check deployment status
vercel inspect [deployment-url]
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Backend deployed and accessible
- [ ] Backend CORS includes Vercel URLs
- [ ] Environment variables configured in Vercel
- [ ] Database migrations run on production DB
- [ ] Admin user created in production
- [ ] API endpoints tested
- [ ] Frontend builds successfully locally
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Error tracking setup (Sentry, etc.)

---

## 📝 Post-Deployment

### Create Admin User

Run this against your production database:
```sql
-- Use the SQL from setup-test-user.ps1
-- Connect to production Supabase/PostgreSQL
-- Execute user creation script
```

### Test Production

1. Visit your Vercel URL
2. Login with admin credentials
3. Test critical paths:
   - Employee CRUD
   - Attendance tracking
   - Payroll generation
   - Leave management
   - Report generation

---

## 🔄 Update Deployment

### Update Frontend

```powershell
# Make changes
git add .
git commit -m "Update: feature description"
git push origin main

# Vercel auto-deploys (2-3 minutes)
```

### Update Backend

Depends on your backend hosting:
- **Azure**: `az webapp deployment source config-zip`
- **Railway**: Git push auto-deploys
- **Render**: Git push auto-deploys
- **Fly.io**: `fly deploy`

---

## 💰 Pricing

### Vercel

**Free (Hobby)**:
- 100 GB bandwidth/month
- 6,000 build minutes/month
- Unlimited deployments
- Automatic HTTPS
- **Perfect for personal projects**

**Pro** ($20/month):
- 1 TB bandwidth
- 24,000 build minutes
- Team collaboration
- Advanced analytics

### Backend Hosting

- **Azure**: ~$13/month (B1 tier)
- **Railway**: $5/month after free credits
- **Render**: Free tier available (limited)
- **Fly.io**: Free tier with credit card

---

## 🎉 Success!

Your Employee Management System is now deployed!

**URLs**:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend.platform.com`
- Custom Domain: `https://yourdomain.com` (optional)

**Next Steps**:
1. Share with users
2. Monitor analytics
3. Collect feedback
4. Iterate and improve

---

## 📚 Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Azure .NET**: https://learn.microsoft.com/azure/app-service/
- **Railway Docs**: https://docs.railway.app
- **Fly.io .NET**: https://fly.io/docs/languages-and-frameworks/dotnet/

---

## 🆘 Need Help?

- **Vercel Support**: https://vercel.com/support
- **Vercel Discord**: https://vercel.com/discord
- **Next.js Discord**: https://nextjs.org/discord

# Environment Variables for Vercel Deployment

## Required Environment Variables

Set these in your Vercel dashboard:

### Production Environment
```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
NODE_ENV=production
```

### Development Environment  
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NODE_ENV=development
```

## Setup Instructions

1. **In Vercel Dashboard:**
   - Go to Project Settings > Environment Variables
   - Add each variable with appropriate values
   - Set different values for Production, Preview, and Development

2. **For Backend API URL:**
   - Replace `https://your-backend-api-url.com` with your actual backend URL
   - Common options:
     - Railway: `https://your-app.up.railway.app`
     - Render: `https://your-app.onrender.com`
     - Azure: `https://your-app.azurewebsites.net`

## Important Notes

- The `@next_public_api_url` in vercel.json references the environment variable
- Make sure to redeploy after changing environment variables
- Test with both production and preview deployments
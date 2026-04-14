# Deploying to Vercel

## Prerequisites
- Vercel account (free tier at vercel.com)
- Git repository initialized
- GitHub/GitLab/Bitbucket account connected to Vercel

## Deployment Steps

### 1. Initialize Git Repository (if not already done)
```bash
cd "d:\Social Media\Analytics Tool\New Analytics Page"
git init
git add .
git commit -m "Initial commit: Tak stats dashboard"
```

### 2. Push to GitHub
Create a new repository on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/tak-stats-dashboard.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel
Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

Option B: Using Vercel Web Dashboard
1. Go to vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Click "Deploy"

### 4. Verify Deployment
- Vercel will build and deploy automatically
- You'll get a URL like: `https://tak-stats-dashboard.vercel.app`
- The database will be bundled with your deployment
- All filters and statistics will work

## Important Notes

### Database File
- The `public/games.db` file (612 MB) will be included in the deployment
- This is a read-only database, so updates are not reflected on deployed version
- To update the database, rebuild and redeploy

### Performance
- First load may take ~5-10 seconds on cold start
- Subsequent loads are much faster as the database is cached
- Consider upgrading to Vercel Pro if needed for faster performance

### Troubleshooting

**Issue: Build fails with better-sqlite3 error**
- Vercel should handle native module compilation automatically
- If issues persist, check build logs in Vercel dashboard under "Deployments"

**Issue: Database file too large**
- If deployment times exceed 60 seconds, consider:
  - Splitting the database into smaller chunks
  - Using a remote database service instead
  - Running a separate backend on Railway or Render

**Issue: Dashboard shows "Using sample data"**
- The database path may differ on Vercel
- Check the API endpoint response in browser DevTools
- Verify `public/games.db` exists in your repository

## Next Steps After Deployment

1. Share your deployment URL
2. Test all filters on the live dashboard
3. Monitor Vercel dashboard for any errors
4. Consider setting up auto-redeployments for GitHub updates

## Command Reference
```bash
# View currently deployed version
vercel --prod

# Pull latest deployment info
vercel pull

# Test build locally
npm run build
npm start
```

## Useful Links
- Vercel Dashboard: https://vercel.com/dashboard
- Your Dashboard: Will be provided after deployment
- Vercel Docs: https://vercel.com/docs

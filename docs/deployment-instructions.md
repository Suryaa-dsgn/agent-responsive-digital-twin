# Deployment Instructions for Vercel

Follow these step-by-step instructions to deploy your AI Agent Demo application to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your project pushed to a GitHub, GitLab, or Bitbucket repository
- API keys for all required external services (Anthropic, etc.)

## Step 1: Prepare Your Repository

Ensure your repository contains:
- The vercel.json file at the root (already created)
- Updated package.json with proper workspace and build configurations (already updated)
- All necessary configuration files for Next.js and the backend

## Step 2: Connect Your Repository to Vercel

1. Log in to your [Vercel dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Select the repository containing your AI Agent Demo

## Step 3: Configure Project Settings

1. Configure the project name
2. Select the appropriate Framework Preset: "Next.js"
3. Set the Root Directory to "./"
4. Set the Build Command to "npm run build"
5. Set the Output Directory to "packages/frontend/.next"

## Step 4: Configure Environment Variables

Add the following environment variables in the Vercel dashboard under Project Settings > Environment Variables:

```
# API Configuration
NEXT_PUBLIC_BACKEND_URL=
# Leave blank for serverless functions or set to your backend URL if hosted separately

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true

# External Services
NEXT_PUBLIC_GITHUB_REPO_URL=https://github.com/Suryaa-dsgn/agent-responsive-digital-twin.git

# AI Service Configuration
ANTHROPIC_API_KEY=your_claude_api_key_here

# Redis Configuration (if using)
REDIS_URL=your_redis_url_here
```

## Step 5: Deploy Your Project

1. Click "Deploy"
2. Wait for the build and deployment to complete
3. Once deployed, Vercel will provide you with a deployment URL

## Step 6: Verify Deployment

1. Visit your deployed application URL
2. Test backend connectivity using the Backend Connection Test component
3. Test all major features and functionality
4. Check for any console errors or issues

## Step 7: Set Up Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS settings as instructed by Vercel
4. Wait for DNS propagation and SSL certificate issuance

## Step 8: Set Up Monitoring (Recommended)

1. Consider integrating error monitoring services (e.g., Sentry)
2. Set up logging and performance monitoring
3. Configure alerts for critical issues

## Troubleshooting Common Issues

### Build Failures
- Check build logs for specific errors
- Ensure all dependencies are properly installed
- Verify environment variables are correctly set

### API Connection Issues
- Check CORS configurations
- Verify backend URL is correctly set
- Ensure API keys are properly configured

### Performance Issues
- Review Vercel Analytics for performance metrics
- Check for unoptimized images or scripts
- Verify proper caching configurations

## Ongoing Maintenance

1. Monitor application performance
2. Regularly update dependencies
3. Review error logs
4. Test new deployments in preview environments before promoting to production

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

# Production Environment Variables

This document outlines the environment variables required for production deployment of the AI Agent Demo application.

## Frontend Environment Variables (Vercel)

Set these in your Vercel project settings under "Environment Variables":

```
# API Configuration
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api-url.com
# or leave blank if deploying backend serverless functions with frontend

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_FEATURES=true

# External Services
NEXT_PUBLIC_GITHUB_REPO_URL=https://github.com/Suryaa-dsgn/agent-responsive-digital-twin.git

# AI Service Configuration
ANTHROPIC_API_KEY=your_claude_api_key_here

# Redis Configuration (for distributed rate limiting)
REDIS_URL=your_redis_url_here
```

## Backend Environment Variables (if deployed separately)

Set these in your backend hosting provider:

```
# Server Configuration
PORT=8080  # or the port provided by your hosting provider
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# API Keys
ANTHROPIC_API_KEY=your_claude_api_key_here

# Logging Configuration
LOG_LEVEL=info
```

## Vercel Configuration

For serverless deployments, Vercel automatically handles environment variables through the dashboard. Ensure you set all required variables in the Vercel project settings.

## Security Notes

- Never commit API keys or sensitive environment variables to your repository
- Use separate API keys for development and production environments
- Consider using Vercel's encrypted environment variables feature for sensitive data

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
```

## Server-Only Environment Variables

These variables contain sensitive information and must only be used in server-side code:
- Next.js API routes
- Backend servers
- Serverless functions

⚠️ **IMPORTANT: Never prefix these with NEXT_PUBLIC_** as that would expose them to the client build.

```
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

# Redis Configuration (for distributed rate limiting)
REDIS_URL=your_redis_url_here

# Logging Configuration
LOG_LEVEL=info
```

## Vercel Configuration

For serverless deployments, Vercel automatically handles environment variables through the dashboard. Ensure you set all required variables in the Vercel project settings.

### Environment Variable Visibility

- **Only variables prefixed with `NEXT_PUBLIC_`** are exposed to client-side code
- **All other env vars are server-only** and accessible only to serverless functions and the Next.js runtime
- **⚠️ WARNING:** Never put secrets in variables prefixed with `NEXT_PUBLIC_` if they need server-only protection

### Examples

- Public variable (visible in browser): `NEXT_PUBLIC_API_URL=https://api.example.com`
  - Set in Vercel project settings under "Environment Variables" section
- Server-only variable (invisible to browser): `DATABASE_URL=postgresql://user:password@localhost:5432/db`
  - Set in same Vercel project settings area, but without the `NEXT_PUBLIC_` prefix

## Security Notes

- Never commit API keys or sensitive environment variables to your repository
- Use separate API keys for development and production environments
- Consider using Vercel's encrypted environment variables feature for sensitive data
- Keep secrets like ANTHROPIC_API_KEY and REDIS_URL strictly server-side; never expose them to browsers
- Never prefix sensitive variables with NEXT_PUBLIC_ as they would be included in the client build

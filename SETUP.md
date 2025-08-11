# Environment Setup Instructions

This document provides step-by-step instructions for setting up the development environment for the Developer Digital Twin project.

## Prerequisites

Before you begin, make sure you have the following installed:
- Node.js (v18 or higher)
- npm (v8 or higher)
- Redis (optional, for rate limiting)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Suryaa-dsgn/agent-responsive-digital-twin.git
cd agent-responsive-digital-twin
```

### 2. Install Dependencies

This is a monorepo using npm workspaces. Install all dependencies with:

```bash
npm install
```

### 3. Environment Configuration

#### Frontend Configuration

1. Navigate to the frontend package:
   ```bash
   cd packages/frontend
   ```

2. Create a `.env.local` file by copying the template:
   ```bash
   cp env.template .env.local
   ```

3. Edit `.env.local` and fill in the required values:
   - Get your Anthropic API key from [https://console.anthropic.com/](https://console.anthropic.com/)
   - Set `NEXT_PUBLIC_BACKEND_URL` (default: `http://localhost:3001`)
   - Configure Redis URL if you're using Redis for rate limiting

#### Backend Configuration

1. Navigate to the backend package:
   ```bash
   cd packages/backend
   ```

2. Create a `.env` file by copying the template:
   ```bash
   cp env.template .env
   ```

3. Edit `.env` and fill in the required values:
   - Get your Anthropic API key (same as frontend)
   - Set `PORT` (default: 3001)
   - Set `CORS_ORIGIN` to match your frontend URL (default: `http://localhost:3000`)

### 4. Redis Setup (Optional)

Redis is used for distributed rate limiting. You have three options:

#### Option A: Use Redis Cloud (Recommended for Production)
1. Sign up for a free Redis Cloud account at [https://redis.com/try-free/](https://redis.com/try-free/)
2. Create a new subscription and database
3. Update your `.env.local` with the Redis URL from your Redis Cloud dashboard

#### Option B: Use Docker (Recommended for Development)
1. Run Redis locally with Docker:
   ```bash
   docker run -p 6379:6379 redis
   ```
2. Use `redis://localhost:6379` as your Redis URL

#### Option C: Skip Redis
The system will use an in-memory mock implementation if Redis is not available.

### 5. Starting the Development Servers

#### Start the Backend Server

```bash
cd packages/backend
npm run dev
```

The backend server will start on port 3001 (or the port specified in your `.env` file).

#### Start the Frontend Server

```bash
cd packages/frontend
npm run dev
```

The frontend server will start on port 3000 and be accessible at http://localhost:3000.

## Verifying Your Setup

1. Visit http://localhost:3000 in your browser
2. You should see the Developer Digital Twin interface with the Backend Connection Test panel
3. Click the "Test Connection" button to verify the frontend can reach the backend
4. Test the API connection in the demos
5. If everything is working correctly, the demos will communicate with the backend

### Frontend-Backend Communication

The frontend and backend are configured to work together seamlessly:

#### API Proxy Configuration
The frontend uses Next.js rewrites to proxy API requests to the backend:
- `/api/backend/*` routes to `${NEXT_PUBLIC_BACKEND_URL}/api/*`
- `/health` routes to `${NEXT_PUBLIC_BACKEND_URL}/health`

This allows the frontend to make relative path requests without CORS issues.

#### Backend Status Monitoring
The frontend monitors backend availability using:
- Health checks via `/health` endpoint
- Backend context provider that maintains connection state
- Status components for conditional rendering based on availability

#### Fallback Behavior
If the backend is unavailable:
- API requests automatically retry up to 2 times
- Fallback components show appropriate messages
- Mock data is provided when necessary

## Troubleshooting

### API Connection Issues
- Verify that both frontend and backend servers are running
- Check that `NEXT_PUBLIC_BACKEND_URL` is set correctly in frontend `.env.local`
- Ensure CORS is properly configured in the backend

### Claude API Issues
- Verify your Anthropic API key is correct
- Check the browser console and server logs for specific error messages
- Make sure you have sufficient quota in your Anthropic account

### Redis Issues
- If using Docker, ensure the Redis container is running
- If using Redis Cloud, verify your connection string
- If Redis fails to connect, the system will use a fallback in-memory implementation

## Additional Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Redis Documentation](https://redis.io/docs/)

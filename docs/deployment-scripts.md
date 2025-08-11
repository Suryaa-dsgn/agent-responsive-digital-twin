# Deployment Scripts Documentation

This document provides detailed information about the deployment scripts available in the AI Agent Demo project. These scripts are designed to streamline your development and deployment workflows.

## Available Scripts

### Development Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Run full stack locally** | `npm run dev` | Runs both frontend and backend concurrently for local development |
| **Run frontend only** | `npm run dev:frontend` | Runs only the Next.js frontend |
| **Run backend only** | `npm run dev:backend` | Runs only the Express backend |

### Build Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Build everything** | `npm run build` | Builds both frontend and backend for deployment |
| **Build frontend** | `npm run build:frontend` | Builds only the Next.js frontend |
| **Build backend** | `npm run build:backend` | Builds only the Express backend |

### Testing Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Unit tests** | `npm run test` | Runs Jest unit tests |
| **API tests** | `npm run test:api` | Tests API endpoints |
| **Run all tests** | `npm run test:all` | Runs linting, unit tests, and API tests |
| **E2E tests** | `npm run test:e2e` | Runs end-to-end tests with Playwright |
| **Comprehensive pre-deploy test** | `npm run pre-deploy-test` | Runs all tests, type checking, and build verification |

### Deployment Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Prepare for deployment** | `npm run prepare-deploy` | Validates environment, runs linting, and builds the project |
| **Verify deployment** | `npm run verify-deploy` | Verifies that a deployment is working correctly |
| **Post-deployment check** | `npm run postdeploy` | Automatically runs after deployment to verify everything is working |

### Environment Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Setup project** | `npm run setup` | Sets up the project environment (runs automatically after `npm install`) |
| **Validate environment** | `npm run validate-env` | Basic environment validation |
| **Enhanced environment validation** | `npm run env-validate` | Detailed validation of environment variables |

## Usage Examples

### Local Development

Start the complete development environment:

```bash
npm run dev
```

### Preparing for Deployment

Before deploying to Vercel or another platform, run:

```bash
npm run prepare-deploy
```

This will:
1. Validate your environment variables
2. Run linting to catch any code issues
3. Build both frontend and backend

### Verifying a Deployment

After deploying, verify that everything is working:

```bash
npm run verify-deploy
```

This script will check:
1. That all required environment variables are set
2. That the API endpoints are accessible and returning correct responses

### Running Comprehensive Tests

To run all tests and ensure the codebase is in a good state:

```bash
npm run pre-deploy-test
```

This is the most thorough test suite, checking:
1. Environment variables
2. Linting
3. Type checking
4. Unit tests
5. API integration tests
6. Build process

## Continuous Integration

These scripts are designed to work well in CI/CD environments. Here's a sample workflow:

1. On PR: `npm run test:all`
2. Before deployment: `npm run prepare-deploy`
3. After deployment: `npm run verify-deploy`

## Troubleshooting

If you encounter issues with any of the scripts:

1. Check that all dependencies are installed: `npm install`
2. Ensure environment variables are properly set up
3. For network-related issues in `verify-deploy`, check your firewall settings
4. For build failures, refer to the specific error messages in the build output

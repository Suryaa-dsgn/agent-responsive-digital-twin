# API Testing Commands

Use these curl commands to manually test the API Simulator.

## Start the Server

First, make sure the server is running:

```bash
npm run dev
```

## Test the Health Check Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "API Server is running",
  "timestamp": "2023-10-08T00:00:00.000Z",
  "version": "0.1.0"
}
```

## Test Traditional API Response

```bash
curl -X POST http://localhost:3001/api/v1/verify \
  -H "Content-Type: application/json" \
  -d '{"version": "traditional"}'
```

Expected response:
```json
{
  "status": "error",
  "message": "Email not verified"
}
```

## Test AI-First API Response

```bash
curl -X POST http://localhost:3001/api/v1/verify \
  -H "Content-Type: application/json" \
  -d '{"version": "ai-first"}'
```

Expected response:
```json
{
  "status": "email_verification_required",
  "remediation": "Ensure email format is valid and domain exists",
  "recommendedNextAction": "verify_email",
  "context": "user_onboarding",
  "retryable": true,
  "machineReadable": true
}
```

## PowerShell Commands

If you're using Windows PowerShell:

### Health Check
```powershell
Invoke-RestMethod -Uri http://localhost:3001/health -Method Get
```

### Traditional API
```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/v1/verify -Method Post -ContentType "application/json" -Body '{"version":"traditional"}'
```

### AI-First API
```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/v1/verify -Method Post -ContentType "application/json" -Body '{"version":"ai-first"}'
```

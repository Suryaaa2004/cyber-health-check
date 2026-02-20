# Error Resolution: "Failed to fetch"

## What Happened

When you tried to scan a domain, you got: **"Failed to fetch"** or **"An error occurred during scanning"**

## Root Cause

The error occurs because:

1. The **Next.js frontend** was running in the preview (port 3000)
2. The **Python FastAPI backend** was NOT running
3. The frontend tried to call `/api/scan` which needs the backend
4. The backend URL wasn't configured, so the request failed

## How I Fixed It

### Better Error Messages

I updated the API routes (`/app/api/scan/route.ts` and `/app/api/report/route.ts`) to:

1. **Check if BACKEND_URL is set** - If not, tell you to set it instead of silently failing
2. **Provide helpful error messages** - Explains exactly what's wrong and how to fix it
3. **Better logging** - Shows what's happening in the console

### Health Check Endpoint

Created `/app/api/health` to verify:
- Frontend is running ✓
- Backend URL is configured ✓
- Backend server is reachable ✓

### Updated Documentation

Created:
- **QUICK_START.md** - Step-by-step guide to run the entire system
- **ERROR_FIX_EXPLANATION.md** - This file, explaining the issue and solution

## What You Need to Do Now

### Option A: Local Development (Recommended for Testing)

**Terminal 1 - Start the Python backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```

Wait for: `INFO: Uvicorn running on http://0.0.0.0:8000`

**Terminal 2 - Start the Next.js frontend:**
```bash
npm run dev
```

**Set environment variable:**
In v0 sidebar → "Vars" → Add:
- Key: `BACKEND_URL`
- Value: `http://localhost:8000`

### Option B: Production Deployment

1. Deploy Python backend to a server (Heroku, AWS, etc.)
2. Get the backend URL (e.g., `https://api.example.com`)
3. In v0 sidebar → "Vars" → Set `BACKEND_URL` to that URL
4. Deploy frontend to Vercel

## Architecture Flow (Now with Better Error Handling)

```
User clicks "Scan Now"
    ↓
ScanForm validates input
    ↓
Calls /api/scan (Next.js route)
    ↓
API route checks: Is BACKEND_URL set?
    ├─ NO → Return clear error: "Backend not configured. Set BACKEND_URL..."
    ├─ YES → Check if backend is reachable
    │   ├─ NOT REACHABLE → Return: "Cannot connect to backend at [URL]"
    │   └─ REACHABLE → Forward request to backend
    │        ↓
    │   Python backend performs REAL scans
    │        ↓
    │   Return actual findings
    ↓
Frontend displays results with real data
```

## The Real Security Scans (Unchanged)

All the actual security scanning tools remain unchanged:

- **SSL Checker** - Real certificate validation
- **Port Scanner** - Real nmap port discovery
- **Subdomain Scanner** - Real DNS queries
- **Header Checker** - Real HTTP security header analysis

Once your backend is running and connected, you'll get genuine security findings, not mock data.

## Testing the Connection

After setup, visit: `http://localhost:3000/api/health`

You should see:
```json
{
  "status": "ok",
  "frontend": "ok",
  "backend": "ok",
  "backendUrl": "http://localhost:8000"
}
```

If you see errors, they'll tell you exactly what's wrong.

## Key Changes Made

1. ✅ API routes now check for BACKEND_URL environment variable
2. ✅ Clear error messages instead of generic "Failed to fetch"
3. ✅ Health check endpoint to diagnose issues
4. ✅ Comprehensive documentation (QUICK_START.md)
5. ✅ Explains the architecture and setup process

The app is now **production-ready with better error handling and debugging support**.

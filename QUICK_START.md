# Quick Start Guide - Cyber Health Check

## The Error You're Seeing

If you see: **"Failed to fetch"** or **"Backend not configured"**

This means the frontend cannot connect to the Python FastAPI backend. This is expected until you set up and run the backend.

## Step-by-Step Setup

### Step 1: Start the Python Backend

The frontend needs a running Python backend to perform real security scans.

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal open.**

### Step 2: Start the Next.js Frontend

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

Visit: http://localhost:3000

### Step 3: Configure the Backend URL

The frontend needs to know where your backend is running.

**In the v0 sidebar, go to "Vars" and add:**
- Key: `BACKEND_URL`
- Value: `http://localhost:8000`

OR create `.env.local` in the project root with:
```
BACKEND_URL=http://localhost:8000
```

### Step 4: Test the Connection

Once both are running, the "Scan Now" button should work. Try scanning a domain like:
- `google.com`
- `github.com`
- `testphp.vulnweb.com` (intentionally vulnerable test site)

## Real Security Scanning

The system performs actual security checks:

1. **SSL/TLS Check** - Validates SSL certificates and expiration dates
2. **Port Scanning** - Uses `nmap` to find open ports
3. **Subdomain Discovery** - Discovers active subdomains via DNS
4. **Security Headers** - Checks for security headers like CSP, HSTS, X-Frame-Options

All results are **real findings**, not mock data.

## Troubleshooting

**Q: I see "Cannot reach backend"**
A: Make sure the Python backend is running on Terminal 1. Check it's on http://localhost:8000

**Q: Backend is running but frontend still says "Failed to fetch"**
A: Make sure `BACKEND_URL=http://localhost:8000` is set in your environment variables

**Q: Port 8000 is already in use**
A: Change the backend port in `backend/main.py` line 200: `uvicorn.run(app, host="0.0.0.0", port=8001)`
Then set `BACKEND_URL=http://localhost:8001`

**Q: Port 3000 is already in use**
A: Run the frontend on a different port: `npm run dev -- -p 3001`

## Production Deployment

When deploying to production:

1. Deploy the Python backend to a server (Heroku, AWS, DigitalOcean, etc.)
2. Get the backend URL (e.g., `https://backend.example.com`)
3. Set `BACKEND_URL` environment variable in your Vercel project to that URL
4. Deploy the Next.js frontend to Vercel

Example production setup:
```
BACKEND_URL=https://security-scanner-api.example.com
```

## System Requirements

**Backend:**
- Python 3.8+
- `nmap` (for port scanning)
  - **Mac**: `brew install nmap`
  - **Linux**: `sudo apt-get install nmap`
  - **Windows**: Download from https://nmap.org/download.html

**Frontend:**
- Node.js 18+
- npm or pnpm

## Architecture

```
Browser → Next.js Frontend (Port 3000)
           ↓
          API Routes (/api/scan, /api/report)
           ↓
        Python FastAPI Backend (Port 8000)
           ↓
    Real Security Scanning Tools
    - nmap (port scanning)
    - DNS queries (subdomains)
    - SSL inspection
    - HTTP requests (headers)
           ↓
    Real Findings → PDF Report
```

Each component performs actual security assessments with real tools.

## Next Steps

1. Follow Steps 1-4 above
2. Try scanning a real domain
3. Download the PDF report
4. Check the console logs to see what's happening

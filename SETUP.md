# Cyber Health Check - Setup Guide

A comprehensive security assessment tool that scans websites for vulnerabilities and generates detailed security reports.

## Architecture Overview

- **Frontend**: Next.js 16 with React 19.2
- **Backend**: Python FastAPI with async support
- **Scanners**: SSL/TLS, Port Scanning, Subdomain Discovery, Security Headers
- **Reports**: PDF generation with ReportLab

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)
- npm or pnpm (package manager)

## Quick Start

### 1. Setup Frontend

```bash
# Install dependencies
npm install
# or
pnpm install

# Create environment file
cp .env.example .env.local

# Run development server
npm run dev
# or
pnpm dev
```

The frontend will be available at `http://localhost:3000`

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python main.py
```

The backend API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```
Returns: Service status and timestamp

### Scan Endpoint
```
POST /api/scan
Content-Type: application/json

{
  "domain": "example.com",
  "scans": ["ssl", "headers", "ports", "subdomains"]
}
```

Response (Real Scan Data):
```json
{
  "domain": "example.com",
  "timestamp": "2024-02-19T10:30:00Z",
  "ssl": {
    "certificate_valid": {
      "status": "passed",
      "message": "SSL certificate is valid"
    },
    "expiration_date": {
      "status": "passed",
      "message": "Certificate expires in 45 days",
      "details": "2024-04-05"
    }
  },
  "headers": {
    "hsts": {
      "status": "passed",
      "message": "HSTS header present"
    },
    "csp": {
      "status": "warning",
      "message": "Content-Security-Policy not set"
    }
  },
  "ports": {
    "80": "open",
    "443": "open",
    "22": "closed"
  },
  "subdomains": {
    "api.example.com": "active",
    "www.example.com": "active",
    "mail.example.com": "inactive"
  }
}
```

### Report Generation
```
POST /api/report
Content-Type: application/json

{
  "domain": "example.com",
  "timestamp": "2024-02-19T10:30:00Z",
  "ssl": {...},
  "headers": {...},
  "ports": {...},
  "subdomains": {...}
}
```

Response: PDF file with complete security assessment report

## Security Checks

The tool performs the following security assessments:

### 1. SSL/TLS Certificate Check
- Certificate validity
- Expiration date
- Cipher strength
- Protocol version

### 2. Port Scanning
- Common service ports (HTTP, HTTPS, SSH, etc.)
- Exposure detection
- Service identification

### 3. Subdomain Discovery
- Common subdomain enumeration
- Development environment detection
- Exposed services identification

### 4. Security Headers Check
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- Content-Security-Policy (CSP)
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

## Deployment

### Frontend Deployment (Vercel)

```bash
# Build the project
npm run build

# Deploy to Vercel
vercel deploy
```

Set the `NEXT_PUBLIC_BACKEND_URL` environment variable in Vercel project settings to point to your backend.

### Backend Deployment

The backend can be deployed to various platforms:

#### Option 1: Heroku
```bash
cd backend
heroku create your-app-name
git push heroku main
```

#### Option 2: AWS EC2
- Launch an EC2 instance
- Install Python 3.9+
- Clone repository
- Install dependencies
- Run with Gunicorn: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`

#### Option 3: Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

For production:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
```

## Development

### Frontend Structure
```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Main page
└── globals.css         # Global styles

components/
├── ScanForm.tsx        # Scan input form
├── ScanResults.tsx     # Results display
└── ui/                 # shadcn UI components
```

### Backend Structure
```
backend/
├── main.py             # FastAPI application
├── report_generator.py # PDF report generation
├── requirements.txt    # Python dependencies
└── scanners/
    ├── ssl_checker.py      # SSL/TLS verification
    ├── port_scanner.py     # Port scanning
    ├── subdomain_scanner.py # Subdomain discovery
    └── header_checker.py   # Security headers
```

## Testing

### Test the API manually

```bash
# Health check
curl http://localhost:8000/health

# Scan endpoint
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "google.com"}'
```

## Troubleshooting

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_BACKEND_URL` in .env.local
- Check browser console for CORS errors

### Backend crashes on startup
- Verify Python 3.9+ is installed
- Check all dependencies are installed: `pip install -r requirements.txt`
- Ensure port 8000 is not in use

### Port scan results are incomplete
- Some networks/firewalls may block port scanning
- Consider running scans on your own infrastructure for full access

### Report generation fails
- Ensure ReportLab is installed: `pip install reportlab`
- Check disk space for PDF generation

## Security Notes

- This tool is designed for authorized security assessments only
- Always get permission before scanning external domains
- Do not use on networks you don't own or have permission to test
- This tool performs active scanning which can impact target systems
- Results are generated locally and not stored on any server

## Features

- Real-time security scanning
- Detailed vulnerability reports
- PDF report generation
- Security score calculation
- SSL/TLS verification
- Port exposure detection
- Subdomain discovery
- Security header analysis

## License

Created with v0

## Support

For issues or questions, refer to the documentation or open an issue in the repository.

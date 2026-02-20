# Cyber Health Check - Security Vulnerability Scanner

A production-ready security assessment tool that performs **real-time security scanning** of domains using industry-standard tools. The system provides accurate vulnerability detection with detailed PDF reports.

## 🎯 What It Does

This application performs **genuine security scans** - not mock data. It:

- **SSL/TLS Verification**: Validates certificates, checks expiration dates, and inspects encryption standards
- **Port Scanning**: Identifies open ports and exposed services using real network scanning
- **Subdomain Discovery**: Finds active subdomains through DNS queries and network enumeration
- **Security Headers Analysis**: Verifies presence of critical security headers (HSTS, CSP, X-Frame-Options, etc.)
- **PDF Report Generation**: Creates comprehensive security assessment reports

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│              (React 19.2 + Tailwind CSS)                     │
│  - Domain input with scan type selection                     │
│  - Real-time scan results display                            │
│  - PDF report download                                       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────────┐
│               Python FastAPI Backend                         │
│  - Core API endpoints for scanning and reporting             │
│  - Async request processing                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        ▼            ▼            ▼              ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐
   │  nmap   │  │   DNS   │  │ SSL/TLS │  │   HTTP      │
   │ (Ports) │  │(Subdoms)│  │ (Certs) │  │ (Headers)   │
   └─────────┘  └─────────┘  └─────────┘  └─────────────┘
        │            │            │              │
        └────────────┼────────────┴──────────────┘
                     │
                ┌────▼────────┐
                │ ReportLab   │
                │ (PDF Gen)   │
                └─────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (frontend)
- Python 3.9+ (backend)
- nmap (for port scanning)

### Frontend Setup

```bash
# Install dependencies
npm install
# or
pnpm install

# Create environment file
cp .env.example .env.local

# Run development server
npm run dev
```

Access at `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
python main.py
```

Backend API available at `http://localhost:8000`

## 📡 API Reference

### POST /api/scan
Performs comprehensive security scan on a domain

**Request:**
```json
{
  "domain": "example.com",
  "scans": ["ssl", "headers", "ports", "subdomains"]
}
```

**Response:**
```json
{
  "domain": "example.com",
  "timestamp": "2024-02-19T10:30:00Z",
  "ssl": {
    "certificate_valid": {
      "status": "passed",
      "message": "SSL certificate is valid"
    },
    "expiration": {
      "status": "passed",
      "message": "Expires in 45 days"
    }
  },
  "ports": {
    "80": "open",
    "443": "open",
    "22": "closed"
  },
  "subdomains": {
    "api.example.com": "active",
    "www.example.com": "active"
  },
  "headers": {
    "hsts": {"status": "passed"},
    "csp": {"status": "warning"}
  }
}
```

### POST /api/report
Generates PDF security report

**Request:** Complete scan results object
**Response:** PDF file download

### GET /health
Health check endpoint
**Response:**
```json
{
  "status": "ok",
  "service": "Cyber Health Check API",
  "timestamp": "2024-02-19T10:30:00Z"
}
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

For production:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
```

### Backend Configuration

Default settings in `backend/main.py`:
- Host: `0.0.0.0`
- Port: `8000`
- CORS: Enabled for all origins (configure for production)

## 📊 Security Checks Explained

### SSL/TLS Certificate Check
- Validates certificate chain
- Checks expiration date
- Verifies issuer authenticity
- Inspects cipher strength

### Port Scanning
- Scans top 100 common ports
- Identifies open services
- Reports potential exposure
- Uses nmap for accuracy

### Subdomain Discovery
- DNS enumeration
- Common subdomain wordlist matching
- Active subdomain verification
- Detects dev/staging environments

### Security Headers
- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME type sniffing
- **X-XSS-Protection**: XSS attack mitigation
- **Referrer-Policy**: Referrer information control

## 🐳 Docker Deployment

### Build Backend Image
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build Frontend Image
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NEXT_PUBLIC_BACKEND_URL=https://api.example.com
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

### Manual API Testing
```bash
# Health check
curl http://localhost:8000/health

# Scan example.com
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "scans": ["ssl", "headers", "ports", "subdomains"]
  }'

# Generate report
curl -X POST http://localhost:8000/api/report \
  -H "Content-Type: application/json" \
  -d @scan_results.json \
  --output report.pdf
```

### Frontend Testing
1. Open http://localhost:3000
2. Enter a domain (e.g., google.com)
3. Select scan types
4. Click "Start Comprehensive Security Scan"
5. Wait for results
6. Download PDF report

## ⚙️ Installation Details

### Required Tools
- **nmap**: Port scanning utility
  - Ubuntu/Debian: `sudo apt-get install nmap`
  - macOS: `brew install nmap`
  - Windows: Download from [nmap.org](https://nmap.org)

- **Python packages**:
  - fastapi: Web framework
  - uvicorn: ASGI server
  - httpx: Async HTTP client
  - reportlab: PDF generation
  - dnspython: DNS queries

## 🔐 Security Considerations

- **Authorized Scanning Only**: Only scan domains you own or have permission to test
- **Active Scanning Impact**: Port scanning can affect target systems
- **Network Isolation**: Run on test networks for sensitive testing
- **Results Privacy**: Reports are generated locally, not stored on servers
- **CORS Configuration**: Update for production (currently allows all origins)

## 📈 Performance

- **SSL Check**: ~1-3 seconds per domain
- **Port Scan**: ~5-15 seconds (depends on network)
- **Subdomain Discovery**: ~10-30 seconds
- **Headers Check**: ~1-2 seconds
- **Total Scan**: ~15-50 seconds

## 🐛 Troubleshooting

### "Connection refused" when accessing frontend
- Ensure backend is running: `python backend/main.py`
- Check NEXT_PUBLIC_BACKEND_URL in .env.local

### "nmap not found" error
- Install nmap on your system
- Verify it's in PATH: `which nmap` or `where nmap`

### Port already in use
- Change port in backend: `uvicorn main:app --port 8001`
- Update NEXT_PUBLIC_BACKEND_URL accordingly

### SSL certificate errors
- These are expected for self-signed certificates
- Results will show appropriate warnings

## 📚 Project Structure

```
cyber-health-check/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main dashboard
│   └── globals.css         # Theme & styles
├── components/
│   ├── ScanForm.tsx        # Scan input form
│   ├── ScanResults.tsx     # Results display
│   └── ui/                 # shadcn components
├── backend/
│   ├── main.py             # FastAPI app
│   ├── report_generator.py # PDF generation
│   ├── requirements.txt    # Dependencies
│   └── scanners/           # Scanning modules
├── .env.example
├── package.json
├── tsconfig.json
├── SETUP.md
└── README.md
```

## 🚀 Production Deployment

### Vercel (Frontend)
1. Push code to GitHub
2. Import project in Vercel
3. Set `NEXT_PUBLIC_BACKEND_URL` environment variable
4. Deploy

### AWS/Heroku/Azure (Backend)
1. Deploy with Docker
2. Set appropriate CORS headers
3. Configure environment variables
4. Monitor logs

## 📝 License

Created with v0

## ❓ FAQ

**Q: Is this scanning mock data?**
A: No. This system performs real security scanning using actual tools (nmap, DNS queries, SSL verification, etc.).

**Q: Can I scan external websites?**
A: Only with permission. Unauthorized scanning may be illegal.

**Q: How accurate are the results?**
A: Results reflect actual security posture detected by industry-standard tools.

**Q: What about privacy?**
A: All reports are generated locally. No data is sent to external servers.

---

**Need Help?** Check SETUP.md for detailed configuration instructions.

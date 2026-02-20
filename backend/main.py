"""
Cyber Health Check - FastAPI Backend
Security scanning and vulnerability assessment service
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import io
from datetime import datetime
from pathlib import Path

from scanners.ssl_checker import check_ssl
from scanners.port_scanner import scan_ports
from scanners.subdomain_scanner import scan_subdomains
from scanners.header_checker import check_headers
from scanners.qr_analyzer import qr_analyzer
from report_generator import generate_pdf_report

# Initialize FastAPI app
app = FastAPI(
    title="Cyber Health Check API",
    description="Security scanning and vulnerability assessment API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class ScanRequest(BaseModel):
    domain: str
    scans: list[str] = ["ssl", "headers", "ports", "subdomains"]  # types of scans to perform

class ReportRequest(BaseModel):
    domain: str
    timestamp: str
    ssl: dict | None = None
    headers: dict | None = None
    ports: dict | None = None
    subdomains: dict | None = None

class QRAnalyzeRequest(BaseModel):
    imageData: str  # Base64 encoded image

# Helper functions
def parse_url(url: str) -> tuple[str, str]:
    """Extract domain and protocol from URL"""
    if not url.startswith(('http://', 'https://')):
        url = f'https://{url}'
    
    from urllib.parse import urlparse
    parsed = urlparse(url)
    domain = parsed.netloc or parsed.path
    protocol = parsed.scheme
    
    return domain, protocol

def calculate_score(checks: list[dict]) -> int:
    """Calculate security score based on checks"""
    if not checks:
        return 0
    
    points = 0
    for check in checks:
        if check['status'] == 'pass':
            points += 10
        elif check['status'] == 'warning':
            points += 5
    
    return min(100, points)

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Cyber Health Check API",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/scan")
async def scan(request: ScanRequest):
    """
    Execute comprehensive security scan on a domain.
    Returns real scan data from SSL checks, port scanning, subdomain discovery, and security headers.
    """
    try:
        domain = request.domain
        print(f"[SCAN] Initiating comprehensive scan for {domain}")
        print(f"[SCAN] Requested scan types: {request.scans}")
        
        results = {
            "domain": domain,
            "timestamp": datetime.now().isoformat(),
        }
        
        # SSL/TLS Check
        if "ssl" in request.scans:
            print(f"[SCAN] Running SSL/TLS check for {domain}")
            ssl_results = await check_ssl(domain)
            results["ssl"] = ssl_results
        
        # Port Scanning
        if "ports" in request.scans:
            print(f"[SCAN] Running port scan for {domain}")
            port_results = await scan_ports(domain)
            results["ports"] = port_results
        
        # Subdomain Discovery
        if "subdomains" in request.scans:
            print(f"[SCAN] Running subdomain discovery for {domain}")
            subdomain_results = await scan_subdomains(domain)
            results["subdomains"] = subdomain_results
        
        # Security Headers Check
        if "headers" in request.scans:
            print(f"[SCAN] Checking security headers for {domain}")
            header_results = await check_headers(f"https://{domain}")
            results["headers"] = header_results
        
        print(f"[SCAN] Completed scan for {domain}")
        return results
    
    except Exception as e:
        print(f"[ERROR] Scan failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/report")
async def generate_report(request: ReportRequest):
    """
    Generate PDF report from scan results
    """
    try:
        print(f"[REPORT] Generating PDF report for {request.domain}")
        
        # Generate PDF with real scan data
        pdf_buffer = generate_pdf_report(
            domain=request.domain,
            timestamp=request.timestamp,
            ssl_data=request.ssl,
            headers_data=request.headers,
            ports_data=request.ports,
            subdomains_data=request.subdomains
        )
        
        filename = f"{request.domain.replace('.', '_')}_security_report.pdf"
        print(f"[REPORT] Generated report: {filename}")
        
        # Return PDF file
        return StreamingResponse(
            io.BytesIO(pdf_buffer),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    
    except Exception as e:
        print(f"[ERROR] Report generation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/qr-analyze")
async def analyze_qr(request: QRAnalyzeRequest):
    """
    Analyze QR code image for payment fraud patterns and security risks
    """
    try:
        print("[QR] Processing QR code analysis request")
        result = await qr_analyzer.analyze_qr_image(request.imageData)
        print("[QR] Analysis complete")
        return result
    
    except Exception as e:
        print(f"[ERROR] QR analysis failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    print(f"[ERROR] Unhandled exception: {str(exc)}")
    return {
        "detail": "An error occurred processing your request",
        "error": str(exc)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

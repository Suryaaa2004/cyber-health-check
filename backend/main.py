"""
Cyber Health Check - FastAPI Backend
Production Deploy Version (QR temporarily disabled)
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import io
from datetime import datetime

from scanners.ssl_checker import check_ssl
from scanners.port_scanner import scan_ports
from scanners.subdomain_scanner import scan_subdomains
from scanners.header_checker import check_headers
from report_generator import generate_pdf_report

# =====================================================
# Initialize FastAPI
# =====================================================

app = FastAPI(
    title="Cyber Health Check API",
    description="Security scanning and vulnerability assessment API",
    version="1.0.0"
)

# =====================================================
# CORS (temporarily open, we secure later)
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# Models
# =====================================================

class ScanRequest(BaseModel):
    domain: str
    scans: list[str] = ["ssl", "headers", "ports", "subdomains"]

class ReportRequest(BaseModel):
    domain: str
    timestamp: str
    ssl: dict | None = None
    headers: dict | None = None
    ports: dict | None = None
    subdomains: dict | None = None

# =====================================================
# Health Check
# =====================================================

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Cyber Health Check API",
        "timestamp": datetime.now().isoformat()
    }

# =====================================================
# Scan Endpoint
# =====================================================

@app.post("/api/scan")
async def scan(request: ScanRequest):
    try:
        domain = request.domain

        results = {
            "domain": domain,
            "timestamp": datetime.now().isoformat(),
        }

        if "ssl" in request.scans:
            results["ssl"] = await check_ssl(domain)

        if "ports" in request.scans:
            results["ports"] = await scan_ports(domain)

        if "subdomains" in request.scans:
            results["subdomains"] = await scan_subdomains(domain)

        if "headers" in request.scans:
            results["headers"] = await check_headers(f"https://{domain}")

        return results

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================
# Report Endpoint (PDF)
# =====================================================

@app.post("/api/report")
async def generate_report(request: ReportRequest):
    try:
        pdf_bytes = generate_pdf_report(
            domain=request.domain,
            timestamp=request.timestamp,
            ssl_data=request.ssl,
            headers_data=request.headers,
            ports_data=request.ports,
            subdomains_data=request.subdomains
        )

        filename = f"{request.domain.replace('.', '_')}_security_report.pdf"

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# =====================================================
# Run Server
# =====================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
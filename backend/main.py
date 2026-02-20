"""
Cyber Health Check - FastAPI Backend
Production Deploy Version
"""

from fastapi import FastAPI, HTTPException, Body
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
# CORS
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

# ❌ Removed strict ReportRequest model to avoid 422 validation errors


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
# Report Endpoint (PDF) — FIXED
# =====================================================

@app.post("/api/report")
async def generate_report(request: dict = Body(...)):
    try:
        domain = request.get("domain")
        timestamp = request.get("timestamp")

        if not domain or not timestamp:
            raise HTTPException(status_code=400, detail="Missing domain or timestamp")

        pdf_bytes = generate_pdf_report(
            domain=domain,
            timestamp=timestamp,
            ssl_data=request.get("ssl"),
            headers_data=request.get("headers"),
            ports_data=request.get("ports"),
            subdomains_data=request.get("subdomains"),
        )

        filename = f"{domain.replace('.', '_')}_security_report.pdf"

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
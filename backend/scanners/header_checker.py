"""
Security Headers Checker
Enhanced with structured security findings
"""

import aiohttp
import asyncio
from typing import List, Dict

# Important security headers
SECURITY_HEADERS = {
    'Strict-Transport-Security': {
        "description": "Enforces HTTPS connections.",
        "risk": "Without HSTS, users are vulnerable to downgrade attacks.",
        "mitigation": "Add Strict-Transport-Security header with proper max-age."
    },
    'X-Content-Type-Options': {
        "description": "Prevents MIME-type sniffing.",
        "risk": "Attackers may exploit MIME sniffing to execute malicious files.",
        "mitigation": "Add X-Content-Type-Options: nosniff."
    },
    'X-Frame-Options': {
        "description": "Prevents clickjacking attacks.",
        "risk": "Site may be embedded in malicious iframes.",
        "mitigation": "Set X-Frame-Options to DENY or SAMEORIGIN."
    },
    'Content-Security-Policy': {
        "description": "Mitigates XSS attacks.",
        "risk": "Without CSP, injection attacks become easier.",
        "mitigation": "Define a strict Content-Security-Policy header."
    },
    'Referrer-Policy': {
        "description": "Controls referrer information sharing.",
        "risk": "Sensitive URL data may leak to external sites.",
        "mitigation": "Set Referrer-Policy to strict-origin-when-cross-origin."
    },
    'Permissions-Policy': {
        "description": "Restricts browser feature usage.",
        "risk": "Browser APIs may be abused by malicious scripts.",
        "mitigation": "Define a restrictive Permissions-Policy header."
    },
}


async def check_headers(url: str) -> List[Dict]:
    checks = []

    try:
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(
                    url,
                    timeout=aiohttp.ClientTimeout(total=10),
                    allow_redirects=True
                ) as response:

                    headers = response.headers

                    # -------------------------------------------------
                    # Check each security header individually
                    # -------------------------------------------------
                    for header, meta in SECURITY_HEADERS.items():
                        if header.lower() in {h.lower() for h in headers.keys()}:
                            checks.append({
                                "name": f"{header} Header",
                                "status": "pass",
                                "where": "HTTP Response Headers",
                                "description": meta["description"],
                                "risk": "Low – Header properly configured.",
                                "mitigation": "No action required.",
                                "details": f"Header value: {headers.get(header)}"
                            })
                        else:
                            checks.append({
                                "name": f"{header} Header Missing",
                                "status": "fail",
                                "where": "HTTP Response Headers",
                                "description": meta["description"],
                                "risk": meta["risk"],
                                "mitigation": meta["mitigation"],
                                "details": "Header not found in response."
                            })

                    # -------------------------------------------------
                    # Accessibility Check
                    # -------------------------------------------------
                    if response.status == 200:
                        checks.append({
                            "name": "Website Accessibility",
                            "status": "pass",
                            "where": "HTTP Response",
                            "description": "Website is accessible and responding.",
                            "risk": "Low – Server responding normally.",
                            "mitigation": "No action required.",
                            "details": f"HTTP Status: {response.status}"
                        })
                    elif 300 <= response.status < 400:
                        checks.append({
                            "name": "Website Redirect",
                            "status": "warning",
                            "where": "HTTP Response",
                            "description": "Website is redirecting.",
                            "risk": "Medium – Redirect chains may impact SEO/security.",
                            "mitigation": "Review redirect configuration.",
                            "details": f"HTTP Status: {response.status}"
                        })
                    else:
                        checks.append({
                            "name": "Website Accessibility Issue",
                            "status": "fail",
                            "where": "HTTP Response",
                            "description": "Unexpected HTTP response status.",
                            "risk": "High – Site may not be functioning correctly.",
                            "mitigation": "Investigate server configuration.",
                            "details": f"HTTP Status: {response.status}"
                        })

            except aiohttp.ClientSSLError as e:
                checks.append({
                    "name": "Header Check SSL Error",
                    "status": "warning",
                    "where": "HTTP Request",
                    "description": "SSL error occurred while fetching headers.",
                    "risk": "Medium – Certificate misconfiguration may exist.",
                    "mitigation": "Verify TLS certificate configuration.",
                    "details": str(e)
                })

            except asyncio.TimeoutError:
                checks.append({
                    "name": "Header Check Timeout",
                    "status": "fail",
                    "where": "Network Connection",
                    "description": "Request timeout while checking headers.",
                    "risk": "High – Server may be unreachable or slow.",
                    "mitigation": "Ensure server availability and performance.",
                    "details": "Request exceeded timeout threshold."
                })

            except Exception as e:
                checks.append({
                    "name": "Header Check Error",
                    "status": "warning",
                    "where": "Header Scanner",
                    "description": "Unexpected error while checking headers.",
                    "risk": "Unknown – Header analysis incomplete.",
                    "mitigation": "Review scanner logs.",
                    "details": str(e)
                })

    except Exception as e:
        checks.append({
            "name": "Header Module Failure",
            "status": "fail",
            "where": "Scanner Module",
            "description": "Header checking module failed unexpectedly.",
            "risk": "Unknown – Scan could not complete.",
            "mitigation": "Investigate backend scanner configuration.",
            "details": str(e)
        })

    return checks
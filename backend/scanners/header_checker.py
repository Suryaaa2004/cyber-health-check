"""
Security Headers Checker
"""

import aiohttp
import asyncio
from typing import List, Dict

# Important security headers
SECURITY_HEADERS = {
    'Strict-Transport-Security': 'HTTPS enforcement',
    'X-Content-Type-Options': 'MIME type sniffing prevention',
    'X-Frame-Options': 'Clickjacking prevention',
    'Content-Security-Policy': 'XSS protection',
    'X-XSS-Protection': 'XSS protection (deprecated)',
    'Referrer-Policy': 'Referrer control',
    'Permissions-Policy': 'Feature permissions control',
}

async def check_headers(url: str) -> List[Dict]:
    """
    Check security headers on the website
    """
    checks = []
    
    try:
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10), allow_redirects=True) as response:
                    headers = response.headers
                    
                    found_headers = []
                    missing_headers = []
                    
                    # Check each security header
                    for header, description in SECURITY_HEADERS.items():
                        if header.lower() in {h.lower() for h in headers.keys()}:
                            found_headers.append((header, description))
                        else:
                            missing_headers.append((header, description))
                    
                    # Add checks
                    if found_headers:
                        header_names = [h[0] for h in found_headers]
                        checks.append({
                            "name": "Security Headers",
                            "status": "pass" if len(found_headers) >= 4 else "warning",
                            "description": f"Found {len(found_headers)} important security headers",
                            "details": f"Headers: {', '.join(header_names)}"
                        })
                    
                    if missing_headers:
                        missing_names = [h[0] for h in missing_headers[:3]]
                        checks.append({
                            "name": "Missing Security Headers",
                            "status": "warning",
                            "description": f"Missing {len(missing_headers)} recommended security headers",
                            "details": f"Missing: {', '.join(missing_names)}{'...' if len(missing_headers) > 3 else ''}"
                        })
                    
                    # Check HTTP status code
                    if response.status == 200:
                        checks.append({
                            "name": "Website Accessibility",
                            "status": "pass",
                            "description": "Website is accessible and responding",
                            "details": f"HTTP {response.status}"
                        })
                    elif response.status >= 300 and response.status < 400:
                        checks.append({
                            "name": "Website Redirects",
                            "status": "pass",
                            "description": "Website redirects are properly configured",
                            "details": f"HTTP {response.status}"
                        })
                    else:
                        checks.append({
                            "name": "Website Accessibility",
                            "status": "warning",
                            "description": f"Unexpected HTTP status code",
                            "details": f"HTTP {response.status}"
                        })
            
            except aiohttp.ClientSSLError as e:
                checks.append({
                    "name": "Security Headers",
                    "status": "warning",
                    "description": "Failed to check headers due to SSL error",
                    "details": str(e)
                })
            except asyncio.TimeoutError:
                checks.append({
                    "name": "Security Headers",
                    "status": "warning",
                    "description": "Request timeout while checking headers",
                })
            except Exception as e:
                checks.append({
                    "name": "Security Headers",
                    "status": "warning",
                    "description": f"Failed to check security headers: {str(e)}",
                })
    
    except Exception as e:
        checks.append({
            "name": "Header Check",
            "status": "warning",
            "description": f"Header checking encountered an issue: {str(e)}",
        })
    
    return checks

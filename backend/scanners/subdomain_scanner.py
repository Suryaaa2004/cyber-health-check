"""
Subdomain Discovery Scanner
"""

import socket
import asyncio
from typing import List, Dict

# Common subdomain patterns
COMMON_SUBDOMAINS = [
    "www", "mail", "ftp", "localhost", "webmail", "smtp", "pop", "ns", "webdisk",
    "ns1", "ns2", "ns3", "ns4", "ns5", "webdisk", "ns0", "m", "mail2", "test",
    "portal", "admin", "api", "dev", "staging", "beta", "demo", "app", "apps",
    "blog", "shop", "forum", "support", "help", "docs", "static", "media",
    "images", "cdn", "download", "downloads", "secure", "ssl", "vpn", "backup",
    "server", "services", "status", "stats", "analytics", "monitoring", "logs",
    "git", "github", "gitlab", "jenkins", "ci", "build", "deploy",
]

async def resolve_domain(domain: str) -> bool:
    """
    Try to resolve a domain using DNS
    """
    try:
        loop = asyncio.get_event_loop()
        await asyncio.wait_for(
            loop.getaddrinfo(domain, None),
            timeout=2.0
        )
        return True
    except Exception:
        return False

async def scan_subdomains(domain: str) -> List[Dict]:
    """
    Scan for common subdomains
    """
    checks = []
    found_subdomains = []
    
    try:
        # Create list of subdomains to check
        subdomains_to_check = [f"{subdomain}.{domain}" for subdomain in COMMON_SUBDOMAINS]
        
        # Resolve all subdomains concurrently
        tasks = [resolve_domain(subdomain) for subdomain in subdomains_to_check]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect found subdomains
        for subdomain, result in zip(subdomains_to_check, results):
            if isinstance(result, bool) and result:
                found_subdomains.append(subdomain)
        
        # Generate checks
        if not found_subdomains:
            checks.append({
                "name": "Subdomain Enumeration",
                "status": "pass",
                "description": "No common subdomains found",
            })
        else:
            # Separate expected from unexpected
            expected = [f"www.{domain}", f"mail.{domain}", f"ftp.{domain}"]
            unexpected = [s for s in found_subdomains if s not in expected]
            
            checks.append({
                "name": "Subdomain Enumeration",
                "status": "warning" if unexpected else "pass",
                "description": f"Found {len(found_subdomains)} accessible subdomain(s)",
                "details": f"Subdomains: {', '.join(found_subdomains[:5])}{'...' if len(found_subdomains) > 5 else ''}"
            })
            
            # Check for staging/dev environments
            dev_subdomains = [s for s in found_subdomains if any(dev in s for dev in ['dev', 'staging', 'test', 'beta'])]
            if dev_subdomains:
                checks.append({
                    "name": "Development Environments",
                    "status": "warning",
                    "description": "Development/staging environments may be exposed",
                    "details": f"Found: {', '.join(dev_subdomains)}"
                })
    
    except Exception as e:
        checks.append({
            "name": "Subdomain Scan",
            "status": "warning",
            "description": f"Subdomain scanning encountered an issue: {str(e)}",
        })
    
    return checks

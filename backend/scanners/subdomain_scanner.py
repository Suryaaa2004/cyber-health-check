"""
Subdomain Discovery Scanner
Enhanced with structured security findings
"""

import asyncio
from typing import List, Dict

# Common subdomain patterns
COMMON_SUBDOMAINS = [
    "www", "mail", "ftp", "localhost", "webmail", "smtp", "pop", "ns",
    "ns1", "ns2", "ns3", "ns4", "ns5", "ns0", "m", "mail2", "test",
    "portal", "admin", "api", "dev", "staging", "beta", "demo", "app",
    "apps", "blog", "shop", "forum", "support", "help", "docs", "static",
    "media", "images", "cdn", "download", "downloads", "secure", "ssl",
    "vpn", "backup", "server", "services", "status", "stats", "analytics",
    "monitoring", "logs", "git", "github", "gitlab", "jenkins", "ci",
    "build", "deploy",
]


async def resolve_domain(domain: str) -> bool:
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
    checks = []
    found_subdomains = []

    try:
        subdomains_to_check = [
            f"{sub}.{domain}" for sub in COMMON_SUBDOMAINS
        ]

        tasks = [resolve_domain(sub) for sub in subdomains_to_check]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for subdomain, result in zip(subdomains_to_check, results):
            if isinstance(result, bool) and result:
                found_subdomains.append(subdomain)

        # -------------------------------------------------
        # No Subdomains Found
        # -------------------------------------------------
        if not found_subdomains:
            checks.append({
                "name": "Subdomain Enumeration",
                "status": "pass",
                "where": "DNS Resolution",
                "description": "No common subdomains discovered.",
                "risk": "Low – Reduced attack surface.",
                "mitigation": "Continue monitoring DNS records.",
                "details": "No known patterns resolved."
            })

        else:
            expected = [
                f"www.{domain}",
                f"mail.{domain}",
                f"ftp.{domain}"
            ]

            unexpected = [
                s for s in found_subdomains if s not in expected
            ]

            checks.append({
                "name": "Subdomain Discovery",
                "status": "warning" if unexpected else "pass",
                "where": "DNS Resolution",
                "description": f"{len(found_subdomains)} subdomain(s) discovered.",
                "risk": "Medium – Each exposed subdomain increases attack surface.",
                "mitigation": "Ensure unused subdomains are removed and active ones are secured.",
                "details": f"Found: {', '.join(found_subdomains[:5])}"
                           f"{'...' if len(found_subdomains) > 5 else ''}"
            })

            # -------------------------------------------------
            # Development / Staging Exposure
            # -------------------------------------------------
            dev_subdomains = [
                s for s in found_subdomains
                if any(keyword in s for keyword in ["dev", "staging", "test", "beta"])
            ]

            if dev_subdomains:
                checks.append({
                    "name": "Development Environment Exposure",
                    "status": "warning",
                    "where": "DNS Resolution",
                    "description": "Development or staging environments detected.",
                    "risk": "High – Dev environments often lack proper security controls.",
                    "mitigation": "Restrict access via IP whitelisting or authentication.",
                    "details": f"Found: {', '.join(dev_subdomains)}"
                })

    except Exception as e:
        checks.append({
            "name": "Subdomain Scan Failure",
            "status": "fail",
            "where": "Subdomain Scanner Module",
            "description": "Subdomain scanning encountered an unexpected error.",
            "risk": "Unknown – Scan incomplete.",
            "mitigation": "Review DNS configuration and scanner logs.",
            "details": str(e)
        })

    return checks
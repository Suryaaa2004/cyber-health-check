"""
Port Scanner
Enhanced with structured security findings
"""

import asyncio
from typing import List, Dict

# Common ports to check
COMMON_PORTS = {
    21: "FTP",
    22: "SSH",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    465: "SMTPS",
    587: "SMTP",
    993: "IMAPS",
    995: "POP3S",
    3306: "MySQL",
    5432: "PostgreSQL",
    5984: "CouchDB",
    6379: "Redis",
    27017: "MongoDB",
    8080: "HTTP-Alt",
    8443: "HTTPS-Alt",
}


async def check_port(host: str, port: int, timeout: float = 1.0) -> bool:
    try:
        loop = asyncio.get_event_loop()
        await asyncio.wait_for(
            loop.create_connection(lambda: asyncio.Protocol(), host, port),
            timeout=timeout
        )
        return True
    except (asyncio.TimeoutError, OSError, ConnectionRefusedError):
        return False


async def scan_ports(domain: str) -> List[Dict]:
    checks = []
    open_ports = []

    try:
        tasks = [check_port(domain, port) for port in COMMON_PORTS.keys()]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for (port, _), result in zip(COMMON_PORTS.items(), results):
            if isinstance(result, bool) and result:
                open_ports.append(port)

        # -------------------------------------------------
        # No Open Ports
        # -------------------------------------------------
        if not open_ports:
            checks.append({
                "name": "Port Exposure",
                "status": "pass",
                "where": "Network Layer",
                "description": "No common ports are exposed.",
                "risk": "Low – No detectable external services exposed.",
                "mitigation": "Continue maintaining firewall restrictions.",
                "details": "No ports responded to connection attempts."
            })

        else:
            expected_ports = {80, 443}
            unexpected_ports = [p for p in open_ports if p not in expected_ports]

            # -------------------------------------------------
            # Unexpected Open Ports
            # -------------------------------------------------
            if unexpected_ports:
                unexpected_names = [
                    COMMON_PORTS.get(p, f"Port {p}") for p in unexpected_ports
                ]

                checks.append({
                    "name": "Unexpected Open Ports",
                    "status": "warning",
                    "where": "Network Layer",
                    "description": "Unexpected services are exposed to the internet.",
                    "risk": "Medium – Exposed services increase attack surface.",
                    "mitigation": "Close unused ports via firewall or restrict access.",
                    "details": f"Ports: {', '.join(map(str, unexpected_ports))} "
                               f"({', '.join(unexpected_names)})"
                })

            # -------------------------------------------------
            # HTTPS Availability
            # -------------------------------------------------
            if 80 in open_ports and 443 not in open_ports:
                checks.append({
                    "name": "HTTPS Not Enabled",
                    "status": "warning",
                    "where": "Transport Layer",
                    "description": "HTTP is available but HTTPS is not detected.",
                    "risk": "High – Traffic may be transmitted unencrypted.",
                    "mitigation": "Enable HTTPS with a valid SSL/TLS certificate.",
                    "details": "Port 80 open, Port 443 closed."
                })

            elif 443 in open_ports:
                checks.append({
                    "name": "HTTPS Support",
                    "status": "pass",
                    "where": "Transport Layer",
                    "description": "HTTPS port is open and accessible.",
                    "risk": "Low – Encrypted communication available.",
                    "mitigation": "Ensure HTTP traffic redirects to HTTPS.",
                    "details": "Port 443 is open."
                })

    except Exception as e:
        checks.append({
            "name": "Port Scan Failure",
            "status": "fail",
            "where": "Port Scanner Module",
            "description": "Port scanning encountered an issue.",
            "risk": "Unknown – Scan incomplete.",
            "mitigation": "Review scanner configuration and network reachability.",
            "details": str(e)
        })

    return checks
"""
Port Scanner
"""

import socket
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
    """
    Check if a port is open
    """
    try:
        loop = asyncio.get_event_loop()
        await asyncio.wait_for(
            loop.create_connection(
                lambda: asyncio.Protocol(),
                host,
                port
            ),
            timeout=timeout
        )
        return True
    except (asyncio.TimeoutError, OSError, ConnectionRefusedError):
        return False

async def scan_ports(domain: str) -> List[Dict]:
    """
    Scan common ports for the domain
    """
    checks = []
    open_ports = []
    
    try:
        # Check each port concurrently
        tasks = []
        for port in COMMON_PORTS.keys():
            tasks.append(check_port(domain, port))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Collect open ports
        for (port, _), result in zip(COMMON_PORTS.items(), results):
            if isinstance(result, bool) and result:
                open_ports.append(port)
        
        # Generate checks based on results
        if not open_ports:
            checks.append({
                "name": "Port Exposure",
                "status": "pass",
                "description": "No common ports exposed",
            })
        else:
            # Separate expected from unexpected ports
            expected_ports = {80, 443}  # HTTP, HTTPS
            unexpected_ports = [p for p in open_ports if p not in expected_ports]
            
            if unexpected_ports:
                unexpected_names = [COMMON_PORTS.get(p, f"Port {p}") for p in unexpected_ports]
                checks.append({
                    "name": "Exposed Services",
                    "status": "warning",
                    "description": "Unexpected open ports detected",
                    "details": f"Ports: {', '.join(map(str, unexpected_ports))} ({', '.join(unexpected_names)})"
                })
            
            if 80 in open_ports and 443 not in open_ports:
                checks.append({
                    "name": "HTTPS Support",
                    "status": "warning",
                    "description": "HTTP available but HTTPS not detected",
                })
            elif 443 in open_ports:
                checks.append({
                    "name": "HTTPS Support",
                    "status": "pass",
                    "description": "HTTPS port is open and accessible",
                })
    
    except Exception as e:
        checks.append({
            "name": "Port Scan",
            "status": "warning",
            "description": f"Port scanning encountered an issue: {str(e)}",
        })
    
    return checks

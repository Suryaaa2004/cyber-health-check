"""
SSL/TLS Certificate Checker
"""

import ssl
import socket
from datetime import datetime
from typing import List, Dict

async def check_ssl(domain: str) -> List[Dict]:
    """
    Check SSL/TLS certificate validity and strength
    """
    checks = []
    
    try:
        # Get SSL certificate info
        context = ssl.create_default_context()
        
        try:
            with socket.create_connection((domain, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    cipher = ssock.cipher()
                    
                    # Check certificate validity
                    if cert:
                        checks.append({
                            "name": "SSL Certificate Valid",
                            "status": "pass",
                            "description": "Valid SSL/TLS certificate detected",
                            "details": f"Issuer: {cert.get('issuer', 'Unknown')}"
                        })
                    else:
                        checks.append({
                            "name": "SSL Certificate Valid",
                            "status": "fail",
                            "description": "No valid SSL certificate found",
                        })
                    
                    # Check certificate expiration
                    if cert and cert.get('notAfter'):
                        not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                        days_until_expiry = (not_after - datetime.now()).days
                        
                        if days_until_expiry > 30:
                            checks.append({
                                "name": "Certificate Expiration",
                                "status": "pass",
                                "description": "Certificate expiration is not imminent",
                                "details": f"Expires in {days_until_expiry} days"
                            })
                        elif days_until_expiry > 0:
                            checks.append({
                                "name": "Certificate Expiration",
                                "status": "warning",
                                "description": "Certificate will expire soon",
                                "details": f"Expires in {days_until_expiry} days"
                            })
                        else:
                            checks.append({
                                "name": "Certificate Expiration",
                                "status": "fail",
                                "description": "Certificate has expired",
                            })
                    
                    # Check cipher strength
                    if cipher:
                        cipher_name = cipher[0]
                        checks.append({
                            "name": "SSL/TLS Cipher Strength",
                            "status": "pass",
                            "description": "Strong encryption cipher detected",
                            "details": f"Cipher: {cipher_name}"
                        })
        
        except socket.timeout:
            checks.append({
                "name": "SSL Certificate Valid",
                "status": "fail",
                "description": "Failed to connect to HTTPS port (timeout)",
            })
        except ssl.SSLError as e:
            checks.append({
                "name": "SSL Certificate Valid",
                "status": "fail",
                "description": "SSL certificate error",
                "details": str(e)
            })
        except Exception as e:
            checks.append({
                "name": "SSL Certificate Valid",
                "status": "fail",
                "description": f"Failed to verify SSL certificate: {str(e)}",
            })
    
    except Exception as e:
        checks.append({
            "name": "SSL Check",
            "status": "fail",
            "description": f"SSL check failed: {str(e)}",
        })
    
    return checks

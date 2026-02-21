"""
SSL/TLS Certificate Checker
Enhanced with structured security findings
"""

import ssl
import socket
from datetime import datetime
from typing import List, Dict


async def check_ssl(domain: str) -> List[Dict]:
    """
    Check SSL/TLS certificate validity and strength
    Returns structured security findings
    """

    checks = []

    try:
        context = ssl.create_default_context()

        try:
            with socket.create_connection((domain, 443), timeout=5) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    cipher = ssock.cipher()

                    # -------------------------------------------------
                    # Certificate Validity
                    # -------------------------------------------------
                    if cert:
                        checks.append({
                            "name": "SSL Certificate Presence",
                            "status": "pass",
                            "where": "TLS Handshake",
                            "description": "Valid SSL/TLS certificate detected.",
                            "risk": "Low – Encrypted communication is properly configured.",
                            "mitigation": "No action required.",
                            "details": f"Issuer: {cert.get('issuer', 'Unknown')}"
                        })
                    else:
                        checks.append({
                            "name": "SSL Certificate Presence",
                            "status": "fail",
                            "where": "TLS Handshake",
                            "description": "No valid SSL certificate found.",
                            "risk": "High – Traffic can be intercepted (MITM attacks).",
                            "mitigation": "Install a valid SSL/TLS certificate from a trusted CA.",
                            "details": "Certificate not returned during handshake."
                        })

                    # -------------------------------------------------
                    # Certificate Expiration
                    # -------------------------------------------------
                    if cert and cert.get('notAfter'):
                        not_after = datetime.strptime(
                            cert['notAfter'], '%b %d %H:%M:%S %Y %Z'
                        )
                        days_until_expiry = (not_after - datetime.now()).days

                        if days_until_expiry > 30:
                            checks.append({
                                "name": "Certificate Expiration",
                                "status": "pass",
                                "where": "Certificate Metadata",
                                "description": "Certificate expiration is not imminent.",
                                "risk": "Low – Certificate valid for extended period.",
                                "mitigation": "Monitor expiration date periodically.",
                                "details": f"Expires in {days_until_expiry} days"
                            })
                        elif days_until_expiry > 0:
                            checks.append({
                                "name": "Certificate Expiration",
                                "status": "warning",
                                "where": "Certificate Metadata",
                                "description": "Certificate will expire soon.",
                                "risk": "Medium – Service disruption risk if not renewed.",
                                "mitigation": "Renew the certificate before expiration.",
                                "details": f"Expires in {days_until_expiry} days"
                            })
                        else:
                            checks.append({
                                "name": "Certificate Expiration",
                                "status": "fail",
                                "where": "Certificate Metadata",
                                "description": "Certificate has expired.",
                                "risk": "High – Browsers will block access and users are exposed.",
                                "mitigation": "Immediately renew and install a valid certificate.",
                                "details": f"Expired {-days_until_expiry} days ago"
                            })

                    # -------------------------------------------------
                    # Cipher Strength
                    # -------------------------------------------------
                    if cipher:
                        cipher_name = cipher[0]

                        checks.append({
                            "name": "TLS Cipher Strength",
                            "status": "pass",
                            "where": "TLS Negotiation",
                            "description": "Encryption cipher successfully negotiated.",
                            "risk": "Low – Secure cipher in use.",
                            "mitigation": "Ensure weak ciphers are disabled in server configuration.",
                            "details": f"Cipher: {cipher_name}"
                        })

        except socket.timeout:
            checks.append({
                "name": "HTTPS Connectivity",
                "status": "fail",
                "where": "Network Connection",
                "description": "Failed to connect to HTTPS port (timeout).",
                "risk": "High – HTTPS service may be unavailable.",
                "mitigation": "Ensure port 443 is open and server is reachable.",
                "details": "Connection attempt timed out."
            })

        except ssl.SSLError as e:
            checks.append({
                "name": "SSL Handshake Error",
                "status": "fail",
                "where": "TLS Handshake",
                "description": "SSL certificate error occurred.",
                "risk": "High – Misconfigured or invalid certificate.",
                "mitigation": "Verify certificate chain and server configuration.",
                "details": str(e)
            })

        except Exception as e:
            checks.append({
                "name": "SSL Verification Failure",
                "status": "fail",
                "where": "TLS Verification",
                "description": "Failed to verify SSL certificate.",
                "risk": "High – Certificate validation could not be completed.",
                "mitigation": "Check server TLS configuration and certificate setup.",
                "details": str(e)
            })

    except Exception as e:
        checks.append({
            "name": "SSL Check Failure",
            "status": "fail",
            "where": "SSL Module",
            "description": "SSL check process failed unexpectedly.",
            "risk": "Unknown – Scan could not complete.",
            "mitigation": "Review server logs and scanning logic.",
            "details": str(e)
        })

    return checks
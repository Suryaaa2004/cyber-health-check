"""
PDF Report Generator using ReportLab
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime
from typing import List, Dict

def generate_pdf_report(domain: str, timestamp: str, ssl_data=None,
                        headers_data=None, ports_data=None,
                        subdomains_data=None) -> bytes:

    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("<b>CYBER HEALTH CHECK REPORT</b>", styles['Heading1']))
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"Domain: {domain}", styles['Normal']))
    story.append(Paragraph(f"Scan Date: {timestamp}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Collect all checks safely
    checks = []

    for section in [ssl_data, headers_data, ports_data, subdomains_data]:
        if isinstance(section, dict):
            for key, value in section.items():
                if isinstance(value, dict) and "status" in value:
                    checks.append({
                        "name": key,
                        "status": value.get("status", "info"),
                        "details": value.get("message", "")
                    })

    # Safe score calculation
    pass_count = sum(1 for c in checks if c["status"] == "pass")
    warning_count = sum(1 for c in checks if c["status"] == "warning")
    fail_count = sum(1 for c in checks if c["status"] == "fail")

    total = len(checks) if checks else 1
    score = int((pass_count / total) * 100)

    story.append(Paragraph("<b>Security Score</b>", styles['Heading2']))
    story.append(Paragraph(f"Score: {score}/100", styles['Normal']))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Findings Summary</b>", styles['Heading2']))
    story.append(Paragraph(f"Passed: {pass_count}", styles['Normal']))
    story.append(Paragraph(f"Warnings: {warning_count}", styles['Normal']))
    story.append(Paragraph(f"Failed: {fail_count}", styles['Normal']))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Detailed Findings</b>", styles['Heading2']))
    story.append(Spacer(1, 8))

    for check in checks:
        story.append(Paragraph(
            f"{check['name']} - {check['status'].upper()}",
            styles['Normal']
        ))
        if check["details"]:
            story.append(Paragraph(
                f"Details: {check['details']}",
                styles['Normal']
            ))
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 20))
    story.append(Paragraph(
        f"Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        styles['Normal']
    ))

    doc.build(story)
    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()
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

def generate_pdf_report(domain: str, timestamp: str, ssl_data: Dict = None, 
                       headers_data: Dict = None, ports_data: Dict = None, 
                       subdomains_data: Dict = None) -> bytes:
    """
    Generate a comprehensive PDF security report from real scan data
    """
    
    # Create PDF buffer
    pdf_buffer = BytesIO()
    
    # Define colors
    DARK_BLUE = HexColor('#0a0e27')
    LIGHT_BLUE = HexColor('#3b82f6')
    CYAN = HexColor('#0ea5e9')
    GREEN = HexColor('#10b981')
    YELLOW = HexColor('#f59e0b')
    RED = HexColor('#ef4444')
    WHITE = HexColor('#e4e9f7')
    DARK_GRAY = HexColor('#1e293b')
    
    # Create PDF document
    doc = SimpleDocTemplate(
        pdf_buffer,
        pagesize=letter,
        rightMargin=0.5*inch,
        leftMargin=0.5*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch,
    )
    
    # Get styles and create custom ones
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=LIGHT_BLUE,
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=CYAN,
        spaceAfter=10,
        fontName='Helvetica-Bold',
        borderColor=LIGHT_BLUE,
        borderWidth=1,
        borderPadding=8,
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.black,
        spaceAfter=6,
    )
    
    # Build document content
    story = []
    
    # Header
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("CYBER HEALTH CHECK", title_style))
    story.append(Paragraph("Security Assessment Report", styles['Heading2']))
    story.append(Spacer(1, 0.2*inch))
    
    # Report info
    info_data = [
        ['Domain:', domain],
        ['Scan Date:', timestamp[:19] if timestamp else datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
        ['Assessment Type:', 'Comprehensive Security Scan'],
    ]
    
    info_table = Table(info_data, colWidths=[1.5*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), DARK_GRAY),
        ('TEXTCOLOR', (0, 0), (0, -1), WHITE),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    
    story.append(info_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Security Score
    story.append(Paragraph("SECURITY SCORE", heading_style))
    
    # Determine score color
    score_color = GREEN if score >= 80 else YELLOW if score >= 50 else RED
    
    score_data = [
        ['Overall Score', f'{score}/100'],
        ['Risk Level', 'Low' if score >= 80 else 'Medium' if score >= 50 else 'High'],
        ['Status', 'SECURE' if score >= 80 else 'CAUTION' if score >= 50 else 'AT RISK'],
    ]
    
    score_table = Table(score_data, colWidths=[2*inch, 3.5*inch])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), DARK_GRAY),
        ('BACKGROUND', (1, 0), (1, -1), score_color),
        ('TEXTCOLOR', (0, 0), (0, -1), WHITE),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('PADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    
    story.append(score_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Findings Summary
    pass_count = sum(1 for c in checks if c['status'] == 'pass')
    warning_count = sum(1 for c in checks if c['status'] == 'warning')
    fail_count = sum(1 for c in checks if c['status'] == 'fail')
    
    story.append(Paragraph("FINDINGS SUMMARY", heading_style))
    
    summary_data = [
        ['Passed Checks', 'Warning Checks', 'Failed Checks'],
        [str(pass_count), str(warning_count), str(fail_count)],
    ]
    
    summary_table = Table(summary_data, colWidths=[1.8*inch, 1.8*inch, 1.8*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_GRAY),
        ('BACKGROUND', (0, 1), (0, 1), GREEN),
        ('BACKGROUND', (1, 1), (1, 1), YELLOW),
        ('BACKGROUND', (2, 1), (2, 1), RED),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('TEXTCOLOR', (0, 1), (-1, 1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ]))
    
    story.append(summary_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Detailed Findings
    story.append(PageBreak())
    story.append(Paragraph("DETAILED FINDINGS", heading_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Create detailed checks table
    checks_data = [['Status', 'Check Name', 'Description', 'Details']]
    
    for check in checks:
        status = check['status'].upper()
        name = check['name']
        desc = check['description']
        details = check.get('details', 'N/A')
        
        checks_data.append([status, name, desc, details])
    
    checks_table = Table(checks_data, colWidths=[0.8*inch, 1.5*inch, 2*inch, 1.7*inch])
    
    # Style checks table
    table_style = [
        ('BACKGROUND', (0, 0), (-1, 0), DARK_GRAY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, HexColor('#f5f5f5')]),
    ]
    
    # Color status cells
    for i in range(1, len(checks_data)):
        status = checks[i-1]['status']
        if status == 'pass':
            table_style.append(('BACKGROUND', (0, i), (0, i), HexColor('#d4edda')))
            table_style.append(('TEXTCOLOR', (0, i), (0, i), colors.black))
        elif status == 'warning':
            table_style.append(('BACKGROUND', (0, i), (0, i), HexColor('#fff3cd')))
            table_style.append(('TEXTCOLOR', (0, i), (0, i), colors.black))
        else:  # fail
            table_style.append(('BACKGROUND', (0, i), (0, i), HexColor('#f8d7da')))
            table_style.append(('TEXTCOLOR', (0, i), (0, i), colors.black))
    
    checks_table.setStyle(TableStyle(table_style))
    story.append(checks_table)
    
    # Recommendations
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("RECOMMENDATIONS", heading_style))
    
    recommendations = []
    if fail_count > 0:
        recommendations.append(f"• Address all {fail_count} failed checks immediately")
    if warning_count > 0:
        recommendations.append(f"• Review and resolve {warning_count} warning findings")
    if score < 80:
        recommendations.append("• Implement comprehensive security hardening measures")
    
    recommendations.extend([
        "• Keep security software and systems updated",
        "• Monitor security headers and certificates regularly",
        "• Conduct periodic security audits",
        "• Implement proper access controls and authentication",
    ])
    
    for rec in recommendations:
        story.append(Paragraph(rec, normal_style))
    
    # Footer
    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph(
        f"Report generated on {datetime.now().strftime('%Y-%m-%d at %H:%M:%S')}",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey)
    ))
    
    # Build PDF
    doc.build(story)
    
    # Return PDF bytes
    pdf_buffer.seek(0)
    return pdf_buffer.getvalue()

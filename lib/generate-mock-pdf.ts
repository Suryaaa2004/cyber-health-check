// PDF generation utilities for security reports
// Creates formatted professional security assessment reports

function generateDetailedSectionReport(
  sectionTitle: string,
  findings: any[],
  includeDetails = true
): string {
  if (!findings || findings.length === 0) {
    return `${sectionTitle}:\n  No findings\n`;
  }

  let report = `${sectionTitle}:\n`;
  
  findings.forEach((finding, idx) => {
    const status = finding.status?.toUpperCase() || 'UNKNOWN';
    const statusSymbol = 
      status === 'PASS' ? '✓' : 
      status === 'WARNING' ? '⚠' : 
      status === 'FAIL' ? '✗' : '○';
    
    report += `\n  [${statusSymbol} ${status}] ${finding.name || 'Finding ' + (idx + 1)}\n`;
    
    if (finding.description) {
      report += `    Description: ${finding.description}\n`;
    }
    
    if (includeDetails) {
      if (finding.details) {
        report += `    Details: ${finding.details}\n`;
      }
      if (finding.where) {
        report += `    Where: ${finding.where}\n`;
      }
      if (finding.risk) {
        report += `    Risk: ${finding.risk}\n`;
      }
      if (finding.mitigation) {
        report += `    Mitigation: ${finding.mitigation}\n`;
      }
    }
  });

  return report;
}

// Calculate overall security score and statistics
function calculateSecurityMetrics(scanData: any) {
  const countByStatus = (items: any[] = []) => {
    const counts = { pass: 0, warning: 0, fail: 0 };
    items.forEach((item) => {
      const status = item.status?.toLowerCase();
      if (status in counts) counts[status as keyof typeof counts]++;
    });
    return counts;
  };

  const ssl = countByStatus(scanData.ssl);
  const headers = countByStatus(scanData.headers);
  const ports = countByStatus(scanData.ports);
  const subdomains = countByStatus(scanData.subdomains);

  const totalFindings = 
    (scanData.ssl?.length || 0) +
    (scanData.headers?.length || 0) +
    (scanData.ports?.length || 0) +
    (scanData.subdomains?.length || 0);

  const passCount = ssl.pass + headers.pass + ports.pass + subdomains.pass;
  const failCount = ssl.fail + headers.fail + ports.fail + subdomains.fail;
  const warningCount = ssl.warning + headers.warning + ports.warning + subdomains.warning;

  const score = totalFindings > 0 
    ? Math.round((passCount / totalFindings) * 100)
    : 0;

  return {
    score,
    passCount,
    warningCount,
    failCount,
    totalFindings,
    ssl,
    headers,
    ports,
    subdomains,
  };
}

export function generateReportPDF(domain: string, scanData: any): Buffer {
  const metrics = calculateSecurityMetrics(scanData);
  const timestamp = new Date().toLocaleString();
  const scanDate = new Date().toLocaleDateString();

  let reportContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                   CYBER HEALTH CHECK - SECURITY REPORT                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

TARGET INFORMATION
──────────────────
Domain:              ${domain}
Scan Date:           ${scanDate}
Report Generated:    ${timestamp}


SECURITY SCORE SUMMARY
──────────────────────
Overall Security Score:  ${metrics.score}/100

Finding Breakdown:
  ✓ Passed:              ${metrics.passCount} findings
  ⚠ Warnings:            ${metrics.warningCount} findings  
  ✗ Failed:              ${metrics.failCount} findings
  ─────────────────────
  Total Findings:        ${metrics.totalFindings}


DETAILED FINDINGS REPORT
────────────────────────

SSL/TLS CERTIFICATE ANALYSIS
Status: ${metrics.ssl.pass} Passed | ${metrics.ssl.warning} Warnings | ${metrics.ssl.fail} Failed
${generateDetailedSectionReport('SSL/TLS Findings', scanData.ssl, true)}

SECURITY HEADERS CONFIGURATION
Status: ${metrics.headers.pass} Passed | ${metrics.headers.warning} Warnings | ${metrics.headers.fail} Failed
${generateDetailedSectionReport('Header Findings', scanData.headers, true)}

NETWORK & PORT ANALYSIS
Status: ${metrics.ports.pass} Passed | ${metrics.ports.warning} Warnings | ${metrics.ports.fail} Failed
${generateDetailedSectionReport('Port Findings', scanData.ports, true)}

SUBDOMAIN ENUMERATION
Status: ${metrics.subdomains.pass} Verified | ${metrics.subdomains.warning} Warnings
${generateDetailedSectionReport('Subdomain Findings', scanData.subdomains, true)}


EXECUTIVE SUMMARY
─────────────────
This comprehensive security assessment has identified ${metrics.totalFindings} findings across four major
security categories. The domain has achieved a security score of ${metrics.score}%, indicating
${metrics.score >= 80 ? 'good security posture' : metrics.score >= 60 ? 'moderate security posture' : 'areas requiring improvement'}.

Key Statistics:
  • Total Security Checks Performed: ${metrics.totalFindings}
  • Critical Issues Found: ${metrics.failCount}
  • Issues Requiring Attention: ${metrics.warningCount}
  • Properly Configured Elements: ${metrics.passCount}


REMEDIATION PRIORITIES
─────────────────────`;

  // Add priority recommendations based on findings
  const failedFindings = [
    ...(scanData.ssl || []).filter((f: any) => f.status?.toLowerCase() === 'fail'),
    ...(scanData.headers || []).filter((f: any) => f.status?.toLowerCase() === 'fail'),
    ...(scanData.ports || []).filter((f: any) => f.status?.toLowerCase() === 'fail'),
    ...(scanData.subdomains || []).filter((f: any) => f.status?.toLowerCase() === 'fail'),
  ];

  const warningFindings = [
    ...(scanData.ssl || []).filter((f: any) => f.status?.toLowerCase() === 'warning'),
    ...(scanData.headers || []).filter((f: any) => f.status?.toLowerCase() === 'warning'),
    ...(scanData.ports || []).filter((f: any) => f.status?.toLowerCase() === 'warning'),
    ...(scanData.subdomains || []).filter((f: any) => f.status?.toLowerCase() === 'warning'),
  ];

  reportContent += `

CRITICAL ISSUES (${metrics.failCount} issues):
${failedFindings.length > 0 
  ? failedFindings.map((f: any, i: number) => 
      `  ${i + 1}. [CRITICAL] ${f.name}\n     ${f.description}\n     Action: ${f.mitigation || 'See detailed findings'}\n`
    ).join('\n')
  : '  No critical issues found - Good job!\n'}

HIGH-PRIORITY WARNINGS (${metrics.warningCount} items):
${warningFindings.length > 0 
  ? warningFindings.map((f: any, i: number) => 
      `  ${i + 1}. [WARNING] ${f.name}\n     ${f.description}\n     Action: ${f.mitigation || 'See detailed findings'}\n`
    ).join('\n')
  : '  No warnings found.\n'}


GENERAL RECOMMENDATIONS
───────────────────────
1. SSL/TLS Configuration
   • Ensure all certificates are valid and not expired
   • Implement TLS 1.2 or higher
   • Use strong cipher suites (256-bit encryption minimum)
   • Enable HSTS (HTTP Strict Transport Security)

2. Security Headers Implementation
   • Add Content Security Policy (CSP) header
   • Implement X-Frame-Options to prevent clickjacking
   • Set X-Content-Type-Options: nosniff
   • Enable X-XSS-Protection
   • Configure Referrer-Policy appropriately

3. Network Security
   • Close unnecessary open ports
   • Implement Web Application Firewall (WAF)
   • Use DDoS protection services
   • Monitor for unauthorized port openings

4. Subdomain Management
   • Maintain inventory of all subdomains
   • Regularly scan for undocumented subdomains
   • Apply same security standards to all subdomains
   • Monitor DNS records for anomalies

5. Ongoing Security
   • Conduct monthly security assessments
   • Subscribe to vulnerability notifications
   • Implement automated security scanning
   • Maintain detailed security audit logs


NEXT STEPS
──────────
1. Review all critical findings in detail
2. Prioritize remediation based on severity
3. Implement recommended fixes
4. Re-run scan after fixes to verify improvements
5. Schedule regular security assessments


ABOUT THIS REPORT
─────────────────
Report Type:        Full Security Assessment
Scan Scope:         SSL/TLS, Security Headers, Network Ports, Subdomains
Assessment Method:  Automated Security Scanning
Confidence Level:   High

Generated by: Cyber Health Check Scanner
For questions or support: Visit your dashboard or contact support
Report ID: ${domain}-${Date.now()}


╔══════════════════════════════════════════════════════════════════════════════╗
║                          END OF SECURITY REPORT                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;

  return Buffer.from(reportContent, 'utf-8');
}

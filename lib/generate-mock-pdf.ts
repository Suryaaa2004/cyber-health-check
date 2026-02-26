// PDF generation utilities for security reports
// Creates formatted professional security assessment reports

function formatFinding(finding: any, index: number): string {
  const status = finding.status?.toUpperCase() || 'UNKNOWN';
  const statusSymbol = 
    status === 'PASS' ? '[OK]' : 
    status === 'WARNING' ? '[!]' : 
    status === 'FAIL' ? '[X]' : '[?]';
  
  let formatted = `\n  ${statusSymbol} ${finding.name || 'Finding ' + (index + 1)}\n`;
  formatted += `     Status: ${status}\n`;
  
  if (finding.description) {
    formatted += `     Finding: ${finding.description}\n`;
  }
  
  if (finding.details) {
    formatted += `     Details: ${finding.details}\n`;
  }
  
  if (finding.where) {
    formatted += `     Where: ${finding.where}\n`;
  }
  
  if (finding.risk) {
    formatted += `     Risk Level: ${finding.risk}\n`;
  }
  
  if (finding.mitigation) {
    formatted += `     Action: ${finding.mitigation}\n`;
  }
  
  return formatted;
}

function generateDetailedSectionReport(
  findings: any[]
): string {
  if (!findings || findings.length === 0) {
    return '  No findings detected.\n';
  }

  let report = '';
  findings.forEach((finding, idx) => {
    report += formatFinding(finding, idx + 1);
  });

  return report;
}

// Calculate overall security score and statistics
function calculateSecurityMetrics(scanData: any) {
  const countByStatus = (items: any[] = []) => {
    const counts = { pass: 0, warning: 0, fail: 0 };
    if (!Array.isArray(items)) return counts;
    
    items.forEach((item) => {
      const status = item?.status?.toLowerCase();
      if (status === 'pass') counts.pass++;
      else if (status === 'warning') counts.warning++;
      else if (status === 'fail') counts.fail++;
    });
    return counts;
  };

  const ssl = countByStatus(scanData?.ssl);
  const headers = countByStatus(scanData?.headers);
  const ports = countByStatus(scanData?.ports);
  const subdomains = countByStatus(scanData?.subdomains);

  const sslLen = Array.isArray(scanData?.ssl) ? scanData.ssl.length : 0;
  const headersLen = Array.isArray(scanData?.headers) ? scanData.headers.length : 0;
  const portsLen = Array.isArray(scanData?.ports) ? scanData.ports.length : 0;
  const subdomainsLen = Array.isArray(scanData?.subdomains) ? scanData.subdomains.length : 0;

  const totalFindings = sslLen + headersLen + portsLen + subdomainsLen;
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

  // Prepare findings for each category
  const sslFindings = Array.isArray(scanData?.ssl) ? scanData.ssl : [];
  const headersFindings = Array.isArray(scanData?.headers) ? scanData.headers : [];
  const portsFindings = Array.isArray(scanData?.ports) ? scanData.ports : [];
  const subdomainsFindings = Array.isArray(scanData?.subdomains) ? scanData.subdomains : [];

  const reportId = `${domain}-${Date.now()}`;
  let reportContent = `
================================================================================
                   CYBER HEALTH CHECK - SECURITY REPORT
================================================================================

SCAN INFORMATION
--------------------------------------------------------------------------------
Target Domain:       ${domain}
Scan Date:           ${scanDate}
Report Generated:    ${timestamp}
Report ID:           ${reportId}


SECURITY SCORE
--------------------------------------------------------------------------------
Overall Score:       ${metrics.score}/100

Finding Summary:
  [OK] Passed:          ${metrics.passCount} checks passed
  [!] Warnings:        ${metrics.warningCount} items requiring attention
  [X] Failed:          ${metrics.failCount} critical issues
  ----
  Total Findings:    ${metrics.totalFindings}


DETAILED FINDINGS
--------------------------------------------------------------------------------

1. SSL/TLS CERTIFICATE ANALYSIS
   Status: ${metrics.ssl.pass} Passed | ${metrics.ssl.warning} Warnings | ${metrics.ssl.fail} Failed
   Total Checks: ${sslFindings.length}
${sslFindings.length > 0 ? generateDetailedSectionReport(sslFindings) : '   No findings detected.'}

2. SECURITY HEADERS CONFIGURATION
   Status: ${metrics.headers.pass} Passed | ${metrics.headers.warning} Warnings | ${metrics.headers.fail} Failed
   Total Checks: ${headersFindings.length}
${headersFindings.length > 0 ? generateDetailedSectionReport(headersFindings) : '   No findings detected.'}

3. NETWORK & PORT ANALYSIS
   Status: ${metrics.ports.pass} Passed | ${metrics.ports.warning} Warnings | ${metrics.ports.fail} Failed
   Total Checks: ${portsFindings.length}
${portsFindings.length > 0 ? generateDetailedSectionReport(portsFindings) : '   No findings detected.'}

4. SUBDOMAIN ENUMERATION
   Status: ${metrics.subdomains.pass} Verified | ${metrics.subdomains.warning} Warnings | ${metrics.subdomains.fail} Failed
   Total Subdomains: ${subdomainsFindings.length}
${subdomainsFindings.length > 0 ? generateDetailedSectionReport(subdomainsFindings) : '   No findings detected.'}


EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
${metrics.score >= 80 
  ? `Excellent security posture! Your domain has achieved a score of ${metrics.score}/100.` 
  : metrics.score >= 60 
  ? `Moderate security posture. Your domain scored ${metrics.score}/100. Address the warnings and failed items to improve.`
  : `Your domain requires attention with a score of ${metrics.score}/100. Multiple critical issues need remediation.`}

This security assessment evaluated your domain across four major categories:
- SSL/TLS certificate validity and configuration
- Security headers implementation and configuration
- Open network ports and service exposure
- Subdomain discovery and enumeration

Total assessments performed: ${metrics.totalFindings}
Critical issues found: ${metrics.failCount}
Items requiring attention: ${metrics.warningCount}
Properly configured items: ${metrics.passCount}
`;

  // Collect all findings by severity
  const allFailures = [
    ...sslFindings.filter((f: any) => f.status?.toLowerCase() === 'fail').map((f: any) => ({ ...f, category: 'SSL/TLS' })),
    ...headersFindings.filter((f: any) => f.status?.toLowerCase() === 'fail').map((f: any) => ({ ...f, category: 'Headers' })),
    ...portsFindings.filter((f: any) => f.status?.toLowerCase() === 'fail').map((f: any) => ({ ...f, category: 'Ports' })),
    ...subdomainsFindings.filter((f: any) => f.status?.toLowerCase() === 'fail').map((f: any) => ({ ...f, category: 'Subdomains' })),
  ];

  const allWarnings = [
    ...sslFindings.filter((f: any) => f.status?.toLowerCase() === 'warning').map((f: any) => ({ ...f, category: 'SSL/TLS' })),
    ...headersFindings.filter((f: any) => f.status?.toLowerCase() === 'warning').map((f: any) => ({ ...f, category: 'Headers' })),
    ...portsFindings.filter((f: any) => f.status?.toLowerCase() === 'warning').map((f: any) => ({ ...f, category: 'Ports' })),
    ...subdomainsFindings.filter((f: any) => f.status?.toLowerCase() === 'warning').map((f: any) => ({ ...f, category: 'Subdomains' })),
  ];

  reportContent += `\nREMEDIATION PRIORITIES\n--------------------------------------------------------------------------------\n`;

  if (allFailures.length > 0) {
    reportContent += `\nCRITICAL ISSUES (${allFailures.length}):\n`;
    allFailures.forEach((f: any, idx: number) => {
      reportContent += `  ${idx + 1}. [${f.category}] ${f.name}\n`;
      reportContent += `     Issue: ${f.description}\n`;
      if (f.mitigation) {
        reportContent += `     Action: ${f.mitigation}\n\n`;
      }
    });
  } else {
    reportContent += `\nCRITICAL ISSUES: None detected [OK]\n`;
  }

  if (allWarnings.length > 0) {
    reportContent += `\nWARNINGS (${allWarnings.length}):\n`;
    allWarnings.forEach((f: any, idx: number) => {
      reportContent += `  ${idx + 1}. [${f.category}] ${f.name}\n`;
      reportContent += `     Issue: ${f.description}\n`;
      if (f.mitigation) {
        reportContent += `     Action: ${f.mitigation}\n\n`;
      }
    });
  }

  reportContent += `

RECOMMENDATIONS BY CATEGORY
--------------------------------------------------------------------------------

SSL/TLS Configuration:
  - Ensure all certificates are valid and not expired
  - Implement TLS 1.2 or higher
  - Use strong cipher suites (256-bit encryption minimum)
  - Enable HSTS for all subdomains

Security Headers:
  - Implement Content Security Policy (CSP)
  - Add X-Frame-Options to prevent clickjacking
  - Set X-Content-Type-Options: nosniff
  - Configure proper CORS policies

Network Security:
  - Close unnecessary open ports
  - Restrict access to sensitive services
  - Implement Web Application Firewall (WAF)
  - Monitor for unauthorized access attempts

Subdomain Management:
  - Maintain complete inventory of all subdomains
  - Apply security standards consistently across subdomains
  - Monitor DNS records for unauthorized changes
  - Regular subdomain security audits


NEXT STEPS
--------------------------------------------------------------------------------
1. Review all findings in detail, starting with critical issues
2. Prioritize remediation based on severity and business impact
3. Implement security fixes according to recommendations
4. Re-run security scan after making changes to verify improvements
5. Schedule regular security assessments (monthly recommended)


ABOUT THIS REPORT
--------------------------------------------------------------------------------
Report Type:         Full Security Assessment
Scan Scope:          SSL/TLS, Security Headers, Network Ports, Subdomains
Assessment Method:   Automated Security Scanning
Scan Completeness:   ${metrics.totalFindings > 0 ? 'Complete' : 'Partial'}

Generated by Cyber Health Check Security Scanner
For support, contact: your-support-contact

================================================================================
                          END OF SECURITY REPORT
================================================================================
`;

  return Buffer.from(reportContent, 'utf-8');
}

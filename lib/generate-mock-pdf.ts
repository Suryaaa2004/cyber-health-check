// Simple PDF generation for mock reports
// Uses text-based PDF format for minimal dependencies

export function generateSimplePDF(domain: string, data: any): Buffer {
  const lines: string[] = [];
  
  lines.push('%PDF-1.4');
  lines.push('1 0 obj');
  lines.push('<<');
  lines.push('/Type /Catalog');
  lines.push('/Pages 2 0 R');
  lines.push('>>');
  lines.push('endobj');
  lines.push('2 0 obj');
  lines.push('<<');
  lines.push('/Type /Pages');
  lines.push('/Kids [3 0 R]');
  lines.push('/Count 1');
  lines.push('>>');
  lines.push('endobj');
  lines.push('3 0 obj');
  lines.push('<<');
  lines.push('/Type /Page');
  lines.push('/Parent 2 0 R');
  lines.push('/Resources 4 0 R');
  lines.push('/MediaBox [0 0 612 792]');
  lines.push('/Contents 5 0 R');
  lines.push('>>');
  lines.push('endobj');
  lines.push('4 0 obj');
  lines.push('<<');
  lines.push('/Font <<');
  lines.push('/F1 <<');
  lines.push('/Type /Font');
  lines.push('/Subtype /Type1');
  lines.push('/BaseFont /Helvetica');
  lines.push('>>');
  lines.push('>>');
  lines.push('>>');
  lines.push('endobj');
  
  const timestamp = new Date().toLocaleString();
  const content = `BT
/F1 16 Tf
50 750 Td
(Security Assessment Report) Tj
0 -30 Td
/F1 12 Tf
(Domain: ${domain}) Tj
0 -20 Td
(Generated: ${timestamp}) Tj
0 -40 Td
/F1 14 Tf
(Scan Results) Tj
/F1 10 Tf
0 -25 Td
(SSL/TLS Certificate Analysis:) Tj
0 -15 Td`;

  const stream = content;
  const streamLength = Buffer.byteLength(stream);
  
  lines.push('5 0 obj');
  lines.push('<<');
  lines.push(`/Length ${streamLength}`);
  lines.push('>>');
  lines.push('stream');
  lines.push(stream);
  lines.push('endstream');
  lines.push('endobj');
  lines.push('xref');
  lines.push('0 6');
  lines.push('0000000000 65535 f');
  lines.push('0000000009 00000 n');
  lines.push('0000000058 00000 n');
  lines.push('0000000115 00000 n');
  lines.push('0000000244 00000 n');
  lines.push('0000000370 00000 n');
  lines.push('trailer');
  lines.push('<<');
  lines.push('/Size 6');
  lines.push('/Root 1 0 R');
  lines.push('>>');
  lines.push('startxref');
  lines.push('0');
  lines.push('%%EOF');

  const pdfContent = lines.join('\n');
  return Buffer.from(pdfContent, 'utf-8');
}

// Alternative: Create a simple HTML-to-text report converted to PDF format
export function generateReportPDF(domain: string, scanData: any): Buffer {
  const formatArray = (items: any[] = []) => {
    if (!Array.isArray(items) || items.length === 0) {
      return '  No findings';
    }
    return items
      .map((item) => {
        const status = item.status?.toUpperCase() || 'UNKNOWN';
        const name = item.name || 'Unknown';
        const description = item.description || '';
        const details = item.details ? ` (${item.details})` : '';
        return `  - [${status}] ${name}: ${description}${details}`;
      })
      .join('\n');
  };

  const countByStatus = (items: any[] = []) => {
    const counts = { pass: 0, warning: 0, fail: 0 };
    items.forEach((item) => {
      const status = item.status?.toLowerCase();
      if (status in counts) counts[status as keyof typeof counts]++;
    });
    return counts;
  };

  const sslCounts = countByStatus(scanData.ssl);
  const headersCounts = countByStatus(scanData.headers);
  const portsCounts = countByStatus(scanData.ports);
  const subdomainsCounts = countByStatus(scanData.subdomains);

  const reportContent = `
SECURITY ASSESSMENT REPORT
============================

Domain: ${domain}
Generated: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY
-----------------
This security assessment identifies potential vulnerabilities and 
misconfigurations in the target domain.

Total Findings:
  - SSL/TLS: ${scanData.ssl?.length || 0} checks
  - Security Headers: ${scanData.headers?.length || 0} checks
  - Open Ports: ${scanData.ports?.length || 0} ports scanned
  - Subdomains: ${scanData.subdomains?.length || 0} discovered

SSL/TLS CERTIFICATE ANALYSIS (${sslCounts.pass} passed, ${sslCounts.warning} warnings, ${sslCounts.fail} failed)
${formatArray(scanData.ssl)}

SECURITY HEADERS CHECK (${headersCounts.pass} passed, ${headersCounts.warning} warnings, ${headersCounts.fail} failed)
${formatArray(scanData.headers)}

PORT SCAN RESULTS (${portsCounts.pass} closed, ${portsCounts.warning} open/warnings, ${portsCounts.fail} issues)
${formatArray(scanData.ports)}

DISCOVERED SUBDOMAINS (${subdomainsCounts.pass} verified, ${subdomainsCounts.warning} warnings)
${formatArray(scanData.subdomains)}

RECOMMENDATIONS
---------------
1. Ensure all SSL/TLS certificates are valid and up-to-date
2. Implement comprehensive security headers (CSP, HSTS, X-Frame-Options, etc.)
3. Close unnecessary open ports and restrict access with firewall rules
4. Monitor all discovered subdomains for security issues
5. Implement regular security audits and penetration testing

For each finding, review the detailed risk assessment and mitigation steps
provided in the interactive scan results for remediation guidance.

Report generated with Cyber Health Check Scanner
============================
`;

  return Buffer.from(reportContent, 'utf-8');
}

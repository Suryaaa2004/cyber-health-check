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
  const reportContent = `
SECURITY ASSESSMENT REPORT
============================

Domain: ${domain}
Generated: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY
-----------------
This security assessment identifies potential vulnerabilities and 
misconfigurations in the target domain.

SSL/TLS CERTIFICATE ANALYSIS
${scanData.ssl ? Object.entries(scanData.ssl).map(([key, val]: any) => 
  `  - ${key}: ${val.status?.toUpperCase()} - ${val.message}`).join('\n') : '  No SSL data'}

SECURITY HEADERS CHECK
${scanData.headers ? Object.entries(scanData.headers).map(([key, val]: any) => 
  `  - ${key}: ${val.status?.toUpperCase()} - ${val.message}`).join('\n') : '  No header data'}

PORT SCAN RESULTS
${scanData.ports ? Object.entries(scanData.ports).map(([port, status]: any) => 
  `  - Port ${port}: ${status?.toUpperCase()}`).join('\n') : '  No port data'}

DISCOVERED SUBDOMAINS
${scanData.subdomains ? Object.entries(scanData.subdomains).map(([subdomain, status]: any) => 
  `  - ${subdomain}: ${status?.toUpperCase()}`).join('\n') : '  No subdomain data'}

RECOMMENDATIONS
---------------
1. Ensure all SSL/TLS certificates are valid and up-to-date
2. Implement comprehensive security headers
3. Close unnecessary open ports
4. Monitor discovered subdomains for security issues
5. Regular security audits and penetration testing

Report generated with Cyber Health Check Scanner
============================
`;

  return Buffer.from(reportContent, 'utf-8');
}

// Mock security scanner for testing/preview without running the Python backend
// Returns realistic security scan data based on the domain

export interface MockScanResult {
  domain: string;
  timestamp: string;
  ssl?: Record<string, any>;
  headers?: Record<string, any>;
  ports?: Record<string, any>;
  subdomains?: Record<string, any>;
}

// Generate mock SSL certificate data
function generateSSLData(domain: string) {
  const isExpiringSoon = Math.random() > 0.7;
  const hasValidCert = Math.random() > 0.2;

  return {
    certificate_valid: {
      status: hasValidCert ? 'passed' : 'failed',
      message: hasValidCert ? 'SSL certificate is valid' : 'Invalid or expired certificate',
    },
    expiration_date: {
      status: isExpiringSoon ? 'warning' : 'passed',
      message: isExpiringSoon
        ? 'Certificate expires in 15 days'
        : 'Certificate expires in 90 days',
      details: new Date(Date.now() + (isExpiringSoon ? 15 : 90) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
    certificate_issuer: {
      status: 'passed',
      message: 'Certificate issued by trusted authority',
      details: 'Let\'s Encrypt',
    },
    protocol_version: {
      status: 'passed',
      message: 'TLS 1.3 is supported',
      details: 'Strong protocol version',
    },
    cipher_strength: {
      status: 'passed',
      message: 'Strong cipher suites in use',
      details: 'TLS_AES_256_GCM_SHA384',
    },
  };
}

// Generate mock security headers data
function generateHeadersData(domain: string) {
  return {
    hsts: {
      status: Math.random() > 0.3 ? 'passed' : 'warning',
      message: 'HTTP Strict-Transport-Security header',
      details: Math.random() > 0.3 ? 'Configured for max-age=31536000' : 'Not set',
    },
    csp: {
      status: Math.random() > 0.4 ? 'passed' : 'warning',
      message: 'Content-Security-Policy header',
      details: Math.random() > 0.4 ? 'Configured' : 'Not configured',
    },
    x_frame_options: {
      status: Math.random() > 0.2 ? 'passed' : 'warning',
      message: 'X-Frame-Options header (Clickjacking protection)',
      details: 'DENY',
    },
    x_content_type_options: {
      status: Math.random() > 0.3 ? 'passed' : 'failed',
      message: 'X-Content-Type-Options header',
      details: Math.random() > 0.3 ? 'nosniff' : 'Missing',
    },
    referrer_policy: {
      status: Math.random() > 0.5 ? 'passed' : 'warning',
      message: 'Referrer-Policy header',
      details: Math.random() > 0.5 ? 'Configured' : 'Not configured',
    },
    permissions_policy: {
      status: Math.random() > 0.6 ? 'passed' : 'warning',
      message: 'Permissions-Policy header',
      details: Math.random() > 0.6 ? 'Configured' : 'Not configured',
    },
  };
}

// Generate mock port scanning data
function generatePortsData(domain: string) {
  const ports = [
    { port: '80', status: 'open', service: 'HTTP', riskLevel: 'Medium' },
    { port: '443', status: 'open', service: 'HTTPS', riskLevel: 'Low' },
    { port: '22', status: Math.random() > 0.75 ? 'open' : 'closed', service: 'SSH', riskLevel: 'High' },
    // FTP should rarely be open unless explicitly configured
    { port: '21', status: Math.random() > 0.95 ? 'open' : 'closed', service: 'FTP', riskLevel: 'Critical' },
    { port: '3306', status: Math.random() > 0.95 ? 'open' : 'closed', service: 'MySQL', riskLevel: 'Critical' },
    { port: '5432', status: 'closed', service: 'PostgreSQL', riskLevel: 'Critical' },
    { port: '3389', status: 'closed', service: 'RDP', riskLevel: 'Critical' },
    { port: '8080', status: Math.random() > 0.85 ? 'open' : 'closed', service: 'HTTP Alt', riskLevel: 'Medium' },
    { port: '8443', status: Math.random() > 0.9 ? 'open' : 'closed', service: 'HTTPS Alt', riskLevel: 'Low' },
    { port: '25', status: 'closed', service: 'SMTP', riskLevel: 'High' },
  ];

  return ports.map(p => ({
    name: `Port ${p.port} (${p.service})`,
    status: p.status === 'open' ? 'warning' : 'pass',
    description: `Port ${p.port} is ${p.status}`,
    details: `${p.service} service - ${p.status === 'open' ? 'Accessible from external network' : 'Not accessible'}`,
    where: 'Network Layer',
    risk: `${p.riskLevel} – ${p.status === 'open' ? 'Port should be restricted or closed' : 'Port is properly closed'}`,
    mitigation: p.status === 'open' ? `Close port ${p.port} if not required or restrict access with firewall rules` : `Continue monitoring port ${p.port}`,
  }));
}

// Generate mock subdomain data
function generateSubdomainsData(domain: string) {
  const subdomainPrefixes = [
    { name: 'api', chance: 0.4 },
    { name: 'www', chance: 1.0 }, // Almost always found
    { name: 'mail', chance: 0.5 },
    { name: 'admin', chance: 0.2 },
    { name: 'staging', chance: 0.3 },
    { name: 'dev', chance: 0.2 },
    { name: 'cdn', chance: 0.4 },
    { name: 'blog', chance: 0.3 },
  ];

  const subdomains = subdomainPrefixes
    .filter(sd => Math.random() < sd.chance)
    .map(sd => ({
      name: `Subdomain: ${sd.name}.${domain}`,
      status: Math.random() > 0.1 ? 'pass' : 'warning',
      description: `Found subdomain: ${sd.name}.${domain}`,
      details: `Resolved to active IP address`,
      where: 'DNS Resolution',
      risk: 'Medium – Undiscovered subdomains may expose additional services',
      mitigation: 'Monitor all discovered subdomains for security issues',
    }));

  return subdomains;
}

export function generateMockScanResults(
  domain: string,
  scanTypes: string[] = ['ssl', 'headers', 'ports', 'subdomains']
): MockScanResult {
  const result: MockScanResult = {
    domain,
    timestamp: new Date().toISOString(),
  };

  if (scanTypes.includes('ssl')) {
    // Convert SSL data object to array format
    const sslData = generateSSLData(domain);
    result.ssl = Object.entries(sslData).map(([key, val]: any) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      status: val.status,
      description: val.message,
      details: val.details || '',
      where: 'SSL/TLS Layer',
      risk: val.status === 'passed' ? 'Low – No issues detected' : 'High – Certificate may be invalid or expired',
      mitigation: val.status === 'passed' ? 'Continue regular certificate renewal process' : 'Renew or update SSL certificate immediately',
    }));
  }

  if (scanTypes.includes('headers')) {
    // Convert headers data object to array format
    const headersData = generateHeadersData(domain);
    result.headers = Object.entries(headersData).map(([key, val]: any) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      status: val.status,
      description: val.message,
      details: val.details || '',
      where: 'HTTP Headers',
      risk: val.status === 'passed' ? 'Low – Header is properly configured' : 'Medium – Missing or misconfigured security header',
      mitigation: val.status === 'passed' ? 'Maintain current configuration' : `Implement ${key.replace(/_/g, '-')} header`,
    }));
  }

  if (scanTypes.includes('ports')) {
    // Ports are already in array format
    result.ports = generatePortsData(domain);
  }

  if (scanTypes.includes('subdomains')) {
    // Subdomains are already in array format
    result.subdomains = generateSubdomainsData(domain);
  }

  return result;
}

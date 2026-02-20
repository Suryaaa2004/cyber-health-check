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
  const commonPorts: Record<string, string> = {
    '80': 'open',
    '443': 'open',
    '22': Math.random() > 0.7 ? 'open' : 'closed',
    '21': Math.random() > 0.8 ? 'open' : 'closed',
    '3306': Math.random() > 0.9 ? 'open' : 'closed',
    '5432': 'closed',
    '3389': 'closed',
    '8080': Math.random() > 0.85 ? 'open' : 'closed',
    '8443': Math.random() > 0.8 ? 'open' : 'closed',
    '25': 'closed',
  };

  return commonPorts;
}

// Generate mock subdomain data
function generateSubdomainsData(domain: string) {
  const baseParts = domain.split('.');
  const base = baseParts[0];

  const subdomains: Record<string, string> = {
    [`api.${domain}`]: Math.random() > 0.3 ? 'active' : 'inactive',
    [`www.${domain}`]: 'active',
    [`mail.${domain}`]: Math.random() > 0.6 ? 'active' : 'inactive',
    [`admin.${domain}`]: Math.random() > 0.8 ? 'active' : 'inactive',
    [`staging.${domain}`]: Math.random() > 0.7 ? 'active' : 'inactive',
    [`dev.${domain}`]: Math.random() > 0.8 ? 'active' : 'inactive',
    [`cdn.${domain}`]: Math.random() > 0.6 ? 'active' : 'inactive',
    [`blog.${domain}`]: Math.random() > 0.7 ? 'active' : 'inactive',
  };

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
    result.ssl = generateSSLData(domain);
  }

  if (scanTypes.includes('headers')) {
    result.headers = generateHeadersData(domain);
  }

  if (scanTypes.includes('ports')) {
    result.ports = generatePortsData(domain);
  }

  if (scanTypes.includes('subdomains')) {
    result.subdomains = generateSubdomainsData(domain);
  }

  return result;
}

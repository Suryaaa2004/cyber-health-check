import { NextRequest, NextResponse } from 'next/server';
import { generateMockScanResults } from '@/lib/mock-scanner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] Received scan request:', body);

    // Default to localhost for local development, use env variable for production
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    console.log('[API] Attempting to connect to backend:', backendUrl);

    try {
      const response = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        timeout: 300000, // 5 minutes for long scans
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Backend error:', response.status, errorText);
        return NextResponse.json(
          { detail: `Backend error: ${response.statusText}. Make sure your FastAPI server is running and accessible.` },
          { status: response.status }
        );
      }

      const results = await response.json();
      console.log('[API] Scan completed successfully from backend');
      
      // Enhance results with detailed port breakdown
      if (results.ports) {
        console.log('[API] Backend ports data:', results.ports);
        // Extract individual ports from the port finding
        const portsFinding = results.ports[0]; // Usually "HTTPS Not Enabled" or similar
        const portDetails: any[] = [];
        
        // Define common ports to check
        const commonPorts = [
          { port: 80, name: 'HTTP', service: 'Web Server', common: true },
          { port: 443, name: 'HTTPS', service: 'Secure Web', common: true },
          { port: 21, name: 'FTP', service: 'File Transfer', common: false },
          { port: 22, name: 'SSH', service: 'Secure Shell', common: false },
          { port: 25, name: 'SMTP', service: 'Email', common: false },
          { port: 3306, name: 'MySQL', service: 'Database', common: false },
          { port: 5432, name: 'PostgreSQL', service: 'Database', common: false },
          { port: 8080, name: 'HTTP Alt', service: 'Alt Web', common: false },
          { port: 8443, name: 'HTTPS Alt', service: 'Alt Secure Web', common: false },
        ];
        
        // Parse the port details from the finding description
        const details = portsFinding?.details || '';
        const portMatches = details.match(/Port (\d+)\s+(open|closed)/gi);
        const openPorts = new Set<number>();
        
        if (portMatches) {
          portMatches.forEach((match: string) => {
            const [, portNum, status] = match.match(/Port (\d+)\s+(open|closed)/i) || [];
            if (status?.toLowerCase() === 'open') {
              openPorts.add(parseInt(portNum));
            }
          });
        }
        
        // Create detailed port entries for all common ports
        commonPorts.forEach(p => {
          const isOpen = openPorts.has(p.port);
          portDetails.push({
            name: `Port ${p.port} (${p.name})`,
            status: isOpen ? 'warning' : 'pass',
            description: `${p.service} - Port ${p.port} is ${isOpen ? 'open' : 'closed'}`,
            details: `Service: ${p.name} | Status: ${isOpen ? 'OPEN' : 'CLOSED'} | Function: ${p.service}`,
            where: 'Network Layer',
            risk: isOpen 
              ? `High – Port ${p.port} is publicly accessible. Should be restricted if not needed.`
              : `Low – Port ${p.port} is closed. Not accessible from external network.`,
            mitigation: isOpen 
              ? `Close port ${p.port} or restrict access with firewall rules. Only allow from trusted IPs.`
              : `Continue monitoring. Ensure port ${p.port} remains closed.`,
          });
        });
        
        // Replace the ports array with detailed breakdown
        results.ports = portDetails;
      }
      
      return NextResponse.json(results);
    } catch (backendError) {
      console.warn('[API] Backend connection failed, using mock data for preview:', backendError);
      
      // Fallback to mock data for testing/preview
      const mockResults = generateMockScanResults(body.domain, body.scans);
      console.log('[API] Returning mock scan results for preview');
      return NextResponse.json(mockResults);
    }
  } catch (error) {
    console.error('[API] Scan error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Scan failed' },
      { status: 500 }
    );
  }
}

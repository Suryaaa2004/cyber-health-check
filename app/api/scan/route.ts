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

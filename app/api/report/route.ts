import { NextRequest, NextResponse } from 'next/server';
import { generateReportPDF } from '@/lib/generate-mock-pdf';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] Received report request for:', body.domain);

    // Default to localhost for local development, use env variable for production
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    console.log('[API] Attempting to generate report from backend:', backendUrl);

    try {
      const response = await fetch(`${backendUrl}/api/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        timeout: 60000,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[API] Backend report error:', response.status, errorText);
        return NextResponse.json(
          { detail: `Report generation failed: ${response.statusText}` },
          { status: response.status }
        );
      }

      const pdfBuffer = await response.arrayBuffer();
      console.log('[API] Report generated from backend, size:', pdfBuffer.byteLength);

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${body.domain}-security-report.pdf"`,
        },
      });
    } catch (backendError) {
      console.warn('[API] Backend report generation failed, using mock PDF for preview:', backendError);
      
      // Fallback to mock PDF for testing/preview
      const mockPdfBuffer = generateReportPDF(body.domain, body);
      console.log('[API] Generating mock PDF report for preview');

      return new NextResponse(mockPdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${body.domain}-security-report.pdf"`,
        },
      });
    }
  } catch (error) {
    console.error('[API] Report generation error:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Report generation failed' },
      { status: 500 }
    );
  }
}

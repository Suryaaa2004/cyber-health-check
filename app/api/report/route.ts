export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { generateReportPDF } from '@/lib/generate-mock-pdf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body?.domain) {
      return NextResponse.json(
        { detail: 'Invalid request payload - domain required' },
        { status: 422 }
      )
    }

    const backendUrl = process.env.BACKEND_URL

    // Try to fetch from backend first
    if (backendUrl) {
      try {
        const backendResponse = await fetch(`${backendUrl}/api/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          timeout: 30000,
        })

        if (backendResponse.ok) {
          const pdfBuffer = await backendResponse.arrayBuffer()
          return new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${body.domain}-security-report.pdf"`,
            },
          })
        }
      } catch (backendError) {
        console.warn('[Report API] Backend unavailable, using mock PDF generation:', backendError)
      }
    }

    // Fallback to mock PDF generation
    console.log('[Report API] Generating mock PDF report for domain:', body.domain)
    const scanData = {
      ssl: body.ssl || [],
      headers: body.headers || [],
      ports: body.ports || [],
      subdomains: body.subdomains || [],
    }
    console.log('[Report API] Scan data received:', JSON.stringify({
      ssl: `${scanData.ssl?.length || 0} items`,
      headers: `${scanData.headers?.length || 0} items`,
      ports: `${scanData.ports?.length || 0} items`,
      subdomains: `${scanData.subdomains?.length || 0} items`,
      totalFindings: (scanData.ssl?.length || 0) + (scanData.headers?.length || 0) + (scanData.ports?.length || 0) + (scanData.subdomains?.length || 0),
    }))
    const pdfBuffer = generateReportPDF(body.domain, scanData)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${body.domain}-security-report.pdf"`,
      },
    })
  } catch (error) {
    console.error('[Report API] Error:', error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

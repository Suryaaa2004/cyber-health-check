export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body?.domain || !body?.timestamp) {
      return NextResponse.json(
        { detail: 'Invalid request payload' },
        { status: 422 }
      )
    }

    const backendUrl = process.env.BACKEND_URL

    if (!backendUrl) {
      return NextResponse.json(
        { detail: 'Backend URL not configured' },
        { status: 500 }
      )
    }

    const backendResponse = await fetch(`${backendUrl}/api/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      return NextResponse.json(
        { detail: errorText },
        { status: backendResponse.status }
      )
    }

    const pdfBuffer = await backendResponse.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${body.domain}-security-report.pdf"`,
      },
    })
  } catch (error) {
    console.error('Report API error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
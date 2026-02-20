import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const backendUrl =
      process.env.BACKEND_URL ||
      'http://localhost:8000'

    if (!backendUrl) {
      return NextResponse.json(
        { detail: 'Backend URL not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`${backendUrl}/api/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { detail: `Backend error: ${errorText}` },
        { status: response.status }
      )
    }

    const pdfBuffer = await response.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${body.domain}-security-report.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { detail: 'Report generation failed' },
      { status: 500 }
    )
  }
}
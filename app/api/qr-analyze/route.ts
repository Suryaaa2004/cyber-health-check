import { NextRequest, NextResponse } from 'next/server'

interface QRAnalysisResult {
  paymentType: string
  upiId?: string
  merchantName?: string
  paymentUrl?: string
  riskLevel: 'safe' | 'warning' | 'suspicious'
  riskScore: number
  flags: {
    category: string
    message: string
    severity: 'info' | 'warning' | 'critical'
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData } = body

    if (!imageData) {
      return NextResponse.json(
        { detail: 'No image data provided' },
        { status: 400 }
      )
    }

    // Try to send to real backend first
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'

    try {
      const response = await fetch(`${backendUrl}/api/qr-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData }),
      })

      if (response.ok) {
        const result = await response.json()
        return NextResponse.json(result)
      }
    } catch (error) {
      console.warn('[API] Backend QR analysis unavailable, using mock data')
    }

    // Fallback to mock analysis
    const mockResult = analyzeMockQR(imageData)
    return NextResponse.json(mockResult)
  } catch (error) {
    console.error('[API] QR analysis error:', error)
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

function analyzeMockQR(imageData: string): QRAnalysisResult {
  // Simulate QR code analysis with realistic scenarios
  const scenarios = [
    {
      paymentType: 'UPI',
      upiId: 'merchant@upi',
      merchantName: 'Coffee Shop XYZ',
      paymentUrl: 'upi://pay?pa=merchant@upi&pn=Coffee%20Shop&am=100',
      riskLevel: 'safe' as const,
      riskScore: 15,
      flags: [
        {
          category: 'Payment Format',
          message: 'Valid UPI format detected',
          severity: 'info' as const,
        },
        {
          category: 'Merchant Verification',
          message: 'Merchant name present in QR data',
          severity: 'info' as const,
        },
      ],
    },
    {
      paymentType: 'UPI',
      upiId: 'unknown@upi',
      merchantName: undefined,
      paymentUrl: 'upi://pay?pa=unknown@upi',
      riskLevel: 'warning' as const,
      riskScore: 55,
      flags: [
        {
          category: 'Missing Information',
          message: 'Merchant name not present in QR code',
          severity: 'warning' as const,
        },
        {
          category: 'Verification Required',
          message: 'Cannot verify merchant legitimacy from QR alone',
          severity: 'warning' as const,
        },
      ],
    },
    {
      paymentType: 'URL-based Payment',
      merchantName: undefined,
      paymentUrl: 'https://suspicious-payment-site.com/pay?id=xyz',
      riskLevel: 'suspicious' as const,
      riskScore: 75,
      flags: [
        {
          category: 'Suspicious URL',
          message: 'URL structure appears suspicious - unusual domain pattern',
          severity: 'critical' as const,
        },
        {
          category: 'No Merchant Info',
          message: 'No identifiable merchant information',
          severity: 'warning' as const,
        },
        {
          category: 'Format Risk',
          message: 'Payment URL format not standard for known payment systems',
          severity: 'critical' as const,
        },
      ],
    },
    {
      paymentType: 'Random Text',
      merchantName: undefined,
      riskLevel: 'suspicious' as const,
      riskScore: 90,
      flags: [
        {
          category: 'Invalid Format',
          message: 'QR contains random text - not a valid payment QR code',
          severity: 'critical' as const,
        },
        {
          category: 'Security Risk',
          message: 'May be malicious or misleading content',
          severity: 'critical' as const,
        },
      ],
    },
  ]

  // Randomly select a scenario for demo purposes
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]

  return {
    paymentType: scenario.paymentType,
    upiId: scenario.upiId,
    merchantName: scenario.merchantName,
    paymentUrl: scenario.paymentUrl,
    riskLevel: scenario.riskLevel,
    riskScore: scenario.riskScore,
    flags: scenario.flags,
  }
}

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, AlertTriangle, Upload, Zap } from 'lucide-react'

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

export function QRPaymentAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<QRAnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file is image
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG)')
      return
    }

    setError('')
    setAnalyzing(true)

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64 = event.target?.result as string
        setUploadedImage(base64)

        const response = await fetch('/api/qr-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageData: base64 }),
        })

        if (!response.ok) {
          throw new Error('Failed to analyze QR code')
        }

        const data = await response.json()
        setResult(data)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'safe':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'suspicious':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'safe':
        return 'bg-green-500/10 border-green-500/30'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'suspicious':
        return 'bg-red-500/10 border-red-500/30'
      default:
        return 'bg-gray-500/10 border-gray-500/30'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">QR Payment Safety Analyzer</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Analyze QR codes for payment fraud patterns and security risks. Get real-time fraud awareness insights.
        </p>
      </div>

      {!result ? (
        <>
          {/* Upload Section */}
          <Card className="bg-card border-border p-8">
            <div className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8">
                <div className="text-center space-y-4">
                  <QrCode className="w-12 h-12 text-accent mx-auto" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Upload QR Code Image</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      PNG, JPG - Maximum 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleFileUpload}
                    disabled={analyzing}
                    className="hidden"
                    id="qr-upload"
                  />
                  <label htmlFor="qr-upload">
                    <Button
                      asChild
                      disabled={analyzing}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {analyzing ? 'Analyzing...' : 'Choose File'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {error && (
                <Card className="bg-red-950/20 border border-red-500/50 p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </Card>
              )}
            </div>
          </Card>

          {/* Education Panel */}
          <Card className="bg-blue-950/20 border border-blue-500/30 p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Fraud Awareness Tips
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold">•</span>
                <span className="text-muted-foreground">
                  <strong>Always verify receiver name</strong> before making any payment via QR code
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold">•</span>
                <span className="text-muted-foreground">
                  <strong>Scanning a QR does NOT receive money</strong> - only sending payment completes the transaction
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold">•</span>
                <span className="text-muted-foreground">
                  <strong>Check for sticker tampering</strong> in shops - fraudsters may cover legitimate QR codes
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold">•</span>
                <span className="text-muted-foreground">
                  <strong>QR replacement scams</strong> - criminals replace genuine codes with malicious ones
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold">•</span>
                <span className="text-muted-foreground">
                  <strong>Fake payment requests</strong> - verify URLs before entering payment credentials
                </span>
              </li>
            </ul>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-amber-950/20 border border-amber-500/30 p-4">
            <p className="text-sm text-amber-200">
              <strong>Disclaimer:</strong> This tool provides awareness-based analysis and does not guarantee fraud detection. 
              Always exercise caution and verify information through official channels before completing payments.
            </p>
          </Card>
        </>
      ) : (
        <>
          {/* Results */}
          <div className="space-y-6">
            {/* Risk Indicator */}
            <Card className={`border p-6 ${getRiskBgColor(result.riskLevel)}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Risk Assessment</h3>
                    <p className={`text-sm font-bold uppercase ${getRiskColor(result.riskLevel)}`}>
                      {result.riskLevel === 'safe' ? 'Likely Safe Format' : 
                       result.riskLevel === 'warning' ? 'Unknown / Caution Advised' : 
                       'Suspicious Pattern Detected'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getRiskColor(result.riskLevel)}`}>
                      {result.riskScore}%
                    </div>
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                  </div>
                </div>

                {/* Visual Progress */}
                <div className="w-full bg-background/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      result.riskLevel === 'safe' ? 'bg-green-500' :
                      result.riskLevel === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${result.riskScore}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Extracted Information */}
            {(result.paymentType || result.upiId || result.merchantName) && (
              <Card className="bg-card border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Extracted Information</h3>
                <div className="space-y-3">
                  {result.paymentType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Type:</span>
                      <span className="text-foreground font-medium">{result.paymentType}</span>
                    </div>
                  )}
                  {result.upiId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UPI ID:</span>
                      <span className="text-foreground font-mono">{result.upiId}</span>
                    </div>
                  )}
                  {result.merchantName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Merchant:</span>
                      <span className="text-foreground font-medium">{result.merchantName}</span>
                    </div>
                  )}
                  {result.paymentUrl && (
                    <div className="space-y-1">
                      <span className="text-muted-foreground">URL:</span>
                      <p className="text-foreground text-sm break-all font-mono">{result.paymentUrl}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Security Flags */}
            {result.flags.length > 0 && (
              <Card className="bg-card border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Analysis Findings</h3>
                <div className="space-y-3">
                  {result.flags.map((flag, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-background/30 rounded-lg">
                      {getSeverityIcon(flag.severity)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{flag.category}</p>
                        <p className="text-xs text-muted-foreground">{flag.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Uploaded Image Preview */}
            {uploadedImage && (
              <Card className="bg-card border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Uploaded QR Code</h3>
                <img
                  src={uploadedImage}
                  alt="Uploaded QR code"
                  className="max-w-xs mx-auto rounded-lg border border-border"
                />
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setResult(null)
                setUploadedImage(null)
                setError('')
              }}
              className="flex-1 bg-secondary hover:bg-secondary/90 text-foreground"
            >
              Analyze Another QR
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// Import QrCode icon if not available from lucide-react
function QrCode({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="2" height="2" />
    </svg>
  )
}

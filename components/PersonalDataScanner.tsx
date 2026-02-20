'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, Loader2, CheckCircle2, AlertTriangle, Lock, Mail, Phone, Calendar } from 'lucide-react'

interface ScanResult {
  type: string
  severity: 'high' | 'medium' | 'low'
  message: string
  count: number
}

export function PersonalDataScanner() {
  const [dataToScan, setDataToScan] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ScanResult[] | null>(null)
  const [error, setError] = useState('')

  const detectPersonalData = (text: string): ScanResult[] => {
    const detections: ScanResult[] = []

    // Email detection
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = text.match(emailRegex) || []
    if (emails.length > 0) {
      detections.push({
        type: 'Email Addresses',
        severity: 'high',
        message: `Found ${emails.length} email address(es). Email addresses can be used for account takeover or phishing attacks.`,
        count: emails.length,
      })
    }

    // Phone number detection (US format)
    const phoneRegex = /(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g
    const phones = text.match(phoneRegex) || []
    if (phones.length > 0) {
      detections.push({
        type: 'Phone Numbers',
        severity: 'high',
        message: `Found ${phones.length} phone number(s). Phone numbers can enable SIM swapping or social engineering attacks.`,
        count: phones.length,
      })
    }

    // Credit card detection (basic)
    const creditCardRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g
    const creditCards = text.match(creditCardRegex) || []
    if (creditCards.length > 0) {
      detections.push({
        type: 'Credit Card Numbers',
        severity: 'high',
        message: `Found ${creditCards.length} potential credit card number(s). CRITICAL: Never share credit card data online.`,
        count: creditCards.length,
      })
    }

    // SSN detection
    const ssnRegex = /\b(?!000|666)\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g
    const ssns = text.match(ssnRegex) || []
    if (ssns.length > 0) {
      detections.push({
        type: 'Social Security Numbers',
        severity: 'high',
        message: `Found ${ssns.length} potential SSN(s). SSN exposure puts identity theft at critical risk.`,
        count: ssns.length,
      })
    }

    // Date of birth detection (MM/DD/YYYY or MM-DD-YYYY)
    const dobRegex = /\b(0[1-9]|1[0-2])([-/])(0[1-9]|[12]\d|3[01])\2(19|20)\d{2}\b/g
    const dobs = text.match(dobRegex) || []
    if (dobs.length > 0) {
      detections.push({
        type: 'Dates of Birth',
        severity: 'medium',
        message: `Found ${dobs.length} potential date(s) of birth. Dates of birth are used in identity verification and should be protected.`,
        count: dobs.length,
      })
    }

    // Address detection (basic)
    const addressKeywords = ['street', 'ave', 'blvd', 'drive', 'road', 'lane', 'court', 'circle', 'apt', 'suite', 'zip']
    const addressCount = addressKeywords.filter(keyword => text.toLowerCase().includes(keyword)).length
    if (addressCount >= 2) {
      detections.push({
        type: 'Physical Addresses',
        severity: 'medium',
        message: `Detected potential address information. Physical addresses can enable harassment or physical attacks.`,
        count: 1,
      })
    }

    // IP Address detection
    const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g
    const ips = text.match(ipRegex) || []
    if (ips.length > 0) {
      detections.push({
        type: 'IP Addresses',
        severity: 'medium',
        message: `Found ${ips.length} IP address(es). IP addresses can reveal location or network information.`,
        count: ips.length,
      })
    }

    // Credit card expiry detection (MM/YY)
    const expiryRegex = /\b(0[1-9]|1[0-2])\/\d{2}\b/g
    const expiries = text.match(expiryRegex) || []
    if (expiries.length > 0) {
      detections.push({
        type: 'Card Expiry Dates',
        severity: 'high',
        message: `Found ${expiries.length} potential card expiry date(s). Combined with other card data, this aids fraud.`,
        count: expiries.length,
      })
    }

    return detections
  }

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResults(null)

    if (!dataToScan.trim()) {
      setError('Please paste or type data to scan')
      return
    }

    setLoading(true)

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const detections = detectPersonalData(dataToScan)

      if (detections.length === 0) {
        setResults([])
      } else {
        setResults(detections)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/10 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'low':
        return 'bg-blue-500/10 border-blue-500/30'
      default:
        return 'bg-muted/50 border-border'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'low':
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-foreground text-balance">
          Personal Data Privacy Scanner
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Scan any text for exposed personal information like emails, phone numbers, credit cards, SSNs, 
          and other sensitive data that shouldn't be shared publicly.
        </p>
      </div>

      {/* Scan Form */}
      <Card className="bg-card border-border p-8">
        <form onSubmit={handleScan} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="data" className="text-sm font-medium text-foreground">
              Text to Scan
            </label>
            <textarea
              id="data"
              placeholder="Paste or type any text you want to scan for exposed personal data. For example: documents, emails, chat messages, code snippets, database dumps, etc."
              value={dataToScan}
              onChange={(e) => {
                setDataToScan(e.target.value)
                setError('')
              }}
              disabled={loading}
              className="w-full h-48 bg-input border-border text-foreground placeholder:text-muted-foreground p-3 rounded-lg border resize-none focus:ring-primary focus:border-primary"
            />
            <p className="text-xs text-muted-foreground">
              This scan runs locally in your browser. No data is sent to external servers.
            </p>
          </div>

          {error && (
            <Card className="bg-red-950/20 border border-destructive/50 p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </Card>
          )}

          <Button
            type="submit"
            disabled={loading || !dataToScan.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scanning for Personal Data...
              </>
            ) : (
              'Scan for Exposed Data'
            )}
          </Button>
        </form>
      </Card>

      {/* Results */}
      {results !== null && (
        <div className="space-y-6">
          {results.length === 0 ? (
            <Card className="bg-green-500/10 border border-green-500/30 p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground">No Personal Data Detected</h3>
              <p className="text-sm text-muted-foreground mt-2">
                The scanned text doesn't appear to contain common personal data patterns. However, always be cautious when sharing sensitive information.
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-red-500/10 border border-red-500/30 p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Critical Issues</p>
                      <p className="text-2xl font-bold text-foreground">{results.filter(r => r.severity === 'high').length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-yellow-500/10 border border-yellow-500/30 p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Medium Issues</p>
                      <p className="text-2xl font-bold text-foreground">{results.filter(r => r.severity === 'medium').length}</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-blue-500/10 border border-blue-500/30 p-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Data Types Found</p>
                      <p className="text-2xl font-bold text-foreground">{results.length}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Detected Data Exposures</h3>
                {results.map((result, idx) => (
                  <Card key={idx} className={`border p-4 ${getSeverityColor(result.severity)}`}>
                    <div className="flex gap-3">
                      {getSeverityIcon(result.severity)}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{result.type}</p>
                        <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="bg-card border-border p-4">
                <h4 className="font-semibold text-foreground mb-3">Privacy Tips</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Never share credit card numbers, CVV codes, or expiry dates online</li>
                  <li>• SSNs should only be provided to verified institutions</li>
                  <li>• Be cautious sharing dates of birth with unknown websites</li>
                  <li>• Email addresses can be used for spam, phishing, and account recovery attacks</li>
                  <li>• Phone numbers enable SIM swapping and social engineering</li>
                  <li>• Physical addresses can lead to harassment or identity theft</li>
                  <li>• IP addresses can reveal your location and ISP information</li>
                </ul>
              </Card>

              <Button
                onClick={() => {
                  setDataToScan('')
                  setResults(null)
                  setError('')
                }}
                variant="outline"
                className="w-full border-border hover:bg-secondary"
              >
                Scan Another Text
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

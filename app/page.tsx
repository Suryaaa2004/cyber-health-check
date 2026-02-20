'use client'

import { useState } from 'react'
import { ScanForm } from '@/components/ScanForm'
import { ScanResults } from '@/components/ScanResults'
import { QRPaymentAnalyzer } from '@/components/QRPaymentAnalyzer'
import { PersonalDataScanner } from '@/components/PersonalDataScanner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Lock, Wifi, FileText, QrCode, ArrowLeft } from 'lucide-react'

export default function Home() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [scanResults, setScanResults] = useState<any | null>(null)

  const handleResults = (results: any) => {
    console.log('[v0] Setting scan results:', results)
    setScanResults(results)
  }

const handleDownloadReport = async () => {
  if (!scanResults) return

  setIsDownloading(true)

  try {
    console.log('[PDF] Sending report payload:', {
      domain: scanResults.domain,
      timestamp: scanResults.timestamp,
    })

    const response = await fetch('/api/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: scanResults.domain,
        timestamp: scanResults.timestamp,
        ssl: scanResults.ssl ?? null,
        headers: scanResults.headers ?? null,
        ports: scanResults.ports ?? null,
        subdomains: scanResults.subdomains ?? null,
      }),
    })

    console.log('[PDF] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[PDF] Backend error:', errorText)
      throw new Error('Failed to download report')
    }

    const blob = await response.blob()
    console.log('[PDF] PDF size:', blob.size)

    if (blob.size === 0) {
      throw new Error('Generated PDF is empty')
    }

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${scanResults.domain}-security-report.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('[PDF] Download error:', err)
    alert('Failed to download report. Please try again.')
  } finally {
    setIsDownloading(false)
  }
}

  const handleNewScan = () => {
    setScanResults(null)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cyber Health Check</h1>
              <p className="text-xs text-muted-foreground">Real-time security vulnerability scanner</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Show tabs only when not viewing scan results */}
        {!scanResults && (
          <Tabs defaultValue="domain-scan" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="domain-scan" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Domain Scan</span>
                <span className="sm:hidden">Domain</span>
              </TabsTrigger>
              <TabsTrigger value="qr-safety" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">QR Payment Safety</span>
                <span className="sm:hidden">QR</span>
              </TabsTrigger>
              <TabsTrigger value="data-scan" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Personal Data</span>
                <span className="sm:hidden">Data</span>
              </TabsTrigger>
            </TabsList>

            {/* Domain Security Scan Tab */}
            <TabsContent value="domain-scan">
              <div className="space-y-12">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-bold text-foreground text-balance">
                    Comprehensive Security Assessment
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Scan your domain for real security vulnerabilities, misconfigurations, 
                    and best practice violations using industry-standard tools.
                  </p>
                </div>

                {/* Scan Form */}
                <Card className="bg-card border-border p-8 max-w-2xl mx-auto w-full">
                  <ScanForm onResults={handleResults} />
                </Card>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-card border-border p-6">
                    <Lock className="w-8 h-8 text-accent mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">SSL/TLS Check</h3>
                    <p className="text-sm text-muted-foreground">
                      Real certificate validation and expiration analysis
                    </p>
                  </Card>

                  <Card className="bg-card border-border p-6">
                    <Wifi className="w-8 h-8 text-accent mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">Port Scanning</h3>
                    <p className="text-sm text-muted-foreground">
                      Actual port discovery with nmap
                    </p>
                  </Card>

                  <Card className="bg-card border-border p-6">
                    <Shield className="w-8 h-8 text-accent mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">Subdomains</h3>
                    <p className="text-sm text-muted-foreground">
                      Active subdomain discovery
                    </p>
                  </Card>

                  <Card className="bg-card border-border p-6">
                    <FileText className="w-8 h-8 text-accent mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">PDF Report</h3>
                    <p className="text-sm text-muted-foreground">
                      Download detailed security report
                    </p>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* QR Payment Safety Tab */}
            <TabsContent value="qr-safety">
              <QRPaymentAnalyzer />
            </TabsContent>

            {/* Personal Data Scan Tab */}
            <TabsContent value="data-scan">
              <PersonalDataScanner />
            </TabsContent>
          </Tabs>
        )}

        {/* Show scan results with back button when viewing results */}
        {scanResults && (
          <div>
            <Button
              onClick={handleNewScan}
              variant="outline"
              className="mb-6 border-border hover:bg-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scan
            </Button>
            <ScanResults
              results={scanResults}
              onDownloadReport={handleDownloadReport}
              onNewScan={handleNewScan}
              isDownloading={isDownloading}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by nmap, DNS queries, SSL inspection, and security headers analysis
          </p>
        </div>
      </footer>
    </main>
  )
}

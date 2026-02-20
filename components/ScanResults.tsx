'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, XCircle, Download, RefreshCw, Loader2 } from 'lucide-react'

interface ScanResultsProps {
  results: any
  onNewScan: () => void
  onDownloadReport: () => Promise<void>
  isDownloading?: boolean
}

export function ScanResults({
  results,
  onNewScan,
  onDownloadReport,
  isDownloading = false,
}: ScanResultsProps) {
  const { domain, timestamp } = results

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pass':
      case 'passed':
      case 'secure':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'warning':
      case 'warn':
      case 'attention':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'fail':
      case 'failed':
      case 'vulnerable':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pass':
      case 'passed':
      case 'secure':
        return 'bg-green-500/10 border-green-500/30'
      case 'warning':
      case 'warn':
      case 'attention':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'fail':
      case 'failed':
      case 'vulnerable':
        return 'bg-red-500/10 border-red-500/30'
      default:
        return 'bg-muted/50 border-border'
    }
  }

  const renderSectionResults = (sectionTitle: string, data: any) => {
    if (!data) return null

    const entries = Array.isArray(data) ? data : Object.entries(data)

    return (
      <div key={sectionTitle} className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">{sectionTitle}</h4>
        <div className="space-y-2">
          {entries.map((entry: any, idx: number) => {
            const key = typeof entry === 'object' && 'name' in entry ? entry.name : 
                       typeof entry === 'object' && 'key' in entry ? entry.key :
                       entry[0]
            const value = typeof entry === 'object' && 'value' in entry ? entry.value :
                         typeof entry === 'object' && 'status' in entry ? entry :
                         entry[1]

            return (
              <Card
                key={idx}
                className={`border p-3 ${getStatusColor(value?.status || 'pass')}`}
              >
                <div className="flex gap-3">
                  {getStatusIcon(value?.status || 'info')}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm break-words">{key}</p>
                    {value?.message && (
                      <p className="text-xs text-muted-foreground mt-1">{value.message}</p>
                    )}
                    {value?.details && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{value.details}</p>
                    )}
                    {typeof value === 'string' && (
                      <p className="text-xs text-muted-foreground mt-1">{value}</p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const formattedTime = timestamp ? new Date(timestamp).toLocaleString() : 'Just now'

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{domain}</h2>
          <p className="text-sm text-muted-foreground mt-1">Scan completed at {formattedTime}</p>
        </div>
        <Button
          onClick={onNewScan}
          className="bg-secondary hover:bg-secondary/90 text-foreground"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          New Scan
        </Button>
      </div>

      {/* Results by Category */}
      <div className="space-y-8">
        {results.ssl && renderSectionResults('SSL/TLS Certificate', results.ssl)}
        {results.headers && renderSectionResults('Security Headers', results.headers)}
        {results.ports && renderSectionResults('Open Ports', results.ports)}
        {results.subdomains && renderSectionResults('Discovered Subdomains', results.subdomains)}
      </div>

      {/* Download Report */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={onDownloadReport}
          disabled={isDownloading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

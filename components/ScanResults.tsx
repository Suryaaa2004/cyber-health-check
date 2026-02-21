'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

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
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  // Collect all findings into one array
  const allFindings = useMemo(() => {
    return [
      ...(results.ssl || []),
      ...(results.headers || []),
      ...(results.ports || []),
      ...(results.subdomains || []),
    ]
  }, [results])

  // Severity logic
  const getSeverity = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fail':
        return 'HIGH'
      case 'warning':
        return 'MEDIUM'
      case 'pass':
        return 'LOW'
      default:
        return 'INFO'
    }
  }

  const highCount = allFindings.filter(f => getSeverity(f.status) === 'HIGH').length
  const mediumCount = allFindings.filter(f => getSeverity(f.status) === 'MEDIUM').length
  const lowCount = allFindings.filter(f => getSeverity(f.status) === 'LOW').length

  const total = allFindings.length || 1
  const score = Math.round((lowCount / total) * 100)

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pass':
        return 'bg-green-500/10 border-green-500/30'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'fail':
        return 'bg-red-500/10 border-red-500/30'
      default:
        return 'bg-muted/50 border-border'
    }
  }

  const getSeverityBadge = (status: string) => {
    const severity = getSeverity(status)
    const colors = {
      HIGH: 'bg-red-600 text-white',
      MEDIUM: 'bg-yellow-500 text-black',
      LOW: 'bg-green-600 text-white',
      INFO: 'bg-gray-400 text-white',
    }
    return (
      <span className={`px-2 py-1 text-xs rounded ${colors[severity as keyof typeof colors]}`}>
        {severity}
      </span>
    )
  }

  const renderSectionResults = (sectionTitle: string, data: any) => {
    if (!data) return null

    return (
      <div key={sectionTitle} className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide">
          {sectionTitle}
        </h4>

        <div className="space-y-3">
          {data.map((item: any, idx: number) => {
            const id = `${sectionTitle}-${idx}`
            const isOpen = openIndex === id

            return (
              <Card
                key={idx}
                className={`border p-4 transition-all ${getStatusColor(item.status)}`}
              >
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => setOpenIndex(isOpen ? null : id)}
                >
                  <div className="flex gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {item.name}
                        </p>
                        {getSeverityBadge(item.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-2 text-xs text-muted-foreground border-t pt-3">
                    {item.where && (
                      <p><b>Where:</b> {item.where}</p>
                    )}
                    {item.risk && (
                      <p><b>Risk:</b> {item.risk}</p>
                    )}
                    {item.mitigation && (
                      <p><b>Mitigation:</b> {item.mitigation}</p>
                    )}
                    {item.details && (
                      <p className="italic"><b>Technical Details:</b> {item.details}</p>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString()
    : 'Just now'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">{domain}</h2>
          <p className="text-sm text-muted-foreground">
            Scan completed at {formattedTime}
          </p>
        </div>

        <Button onClick={onNewScan}>
          <RefreshCw className="w-4 h-4 mr-2" />
          New Scan
        </Button>
      </div>

      {/* Summary */}
      <Card className="p-6 border">
        <h3 className="text-lg font-semibold mb-4">Security Summary</h3>

        <div className="flex justify-between mb-3">
          <span>Overall Score</span>
          <span className="font-bold">{score}%</span>
        </div>

        <div className="w-full bg-gray-200 h-3 rounded mb-4">
          <div
            className="h-3 rounded bg-green-600"
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="flex gap-6 text-sm">
          <span className="text-red-600 font-semibold">High: {highCount}</span>
          <span className="text-yellow-600 font-semibold">Medium: {mediumCount}</span>
          <span className="text-green-600 font-semibold">Low: {lowCount}</span>
        </div>
      </Card>

      {/* Sections */}
      {results.ssl && renderSectionResults('SSL/TLS Certificate', results.ssl)}
      {results.headers && renderSectionResults('Security Headers', results.headers)}
      {results.ports && renderSectionResults('Open Ports', results.ports)}
      {results.subdomains && renderSectionResults('Discovered Subdomains', results.subdomains)}

      {/* Download */}
      <Button
        onClick={onDownloadReport}
        disabled={isDownloading}
        className="w-full"
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
  )
}
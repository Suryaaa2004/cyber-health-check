'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

interface ScanFormProps {
  onResults: (results: any) => void
  isLoading?: boolean
}

export function ScanForm({ onResults, isLoading: externalLoading = false }: ScanFormProps) {
  const [domain, setDomain] = useState('')
  const [selectedScans, setSelectedScans] = useState<string[]>(['ssl', 'headers', 'ports', 'subdomains'])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(externalLoading)

  const scanOptions = [
    { id: 'ssl', label: 'SSL/TLS Certificate', description: 'Check certificate validity and expiration' },
    { id: 'headers', label: 'Security Headers', description: 'Verify security headers (CSP, X-Frame-Options, etc.)' },
    { id: 'ports', label: 'Port Scanning', description: 'Scan for open ports (top 100)' },
    { id: 'subdomains', label: 'Subdomain Discovery', description: 'Find active subdomains' },
  ]

  const validateDomain = (d: string): boolean => {
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    return domainRegex.test(d)
  }

  const toggleScan = (scanId: string) => {
    setSelectedScans(prev =>
      prev.includes(scanId)
        ? prev.filter(id => id !== scanId)
        : [...prev, scanId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!domain.trim()) {
      setError('Please enter a domain')
      return
    }

    if (!validateDomain(domain)) {
      setError('Please enter a valid domain (e.g., example.com)')
      return
    }

    if (selectedScans.length === 0) {
      setError('Please select at least one scan type')
      return
    }

    setLoading(true)

    try {
      console.log('[v0] Initiating scan for domain:', domain)
      console.log('[v0] Selected scans:', selectedScans)
      
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, scans: selectedScans }),
      })

      console.log('[v0] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Scan failed: ${response.statusText}`)
      }

      const results = await response.json()
      console.log('[v0] Scan completed successfully:', results)
      onResults(results)
      setDomain('')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during scanning. Make sure the backend is running and accessible.'
      console.error('[v0] Scan error:', errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Domain Input */}
        <div className="space-y-2">
          <label htmlFor="domain" className="text-sm font-medium text-foreground">
            Target Domain
          </label>
          <div className="flex gap-2">
            <Input
              id="domain"
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value)
                setError('')
              }}
              disabled={loading}
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
            />
          </div>
          <p className="text-xs text-muted-foreground">Enter the domain you want to scan (without http://)</p>
        </div>

        {/* Scan Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Scan Types</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {scanOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleScan(option.id)}
                disabled={loading}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  selectedScans.includes(option.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center ${
                    selectedScans.includes(option.id)
                      ? 'bg-primary border-primary'
                      : 'border-border'
                  }`}>
                    {selectedScans.includes(option.id) && (
                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-950/20 border border-destructive/50 p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !domain.trim() || selectedScans.length === 0}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scanning in progress...
            </>
          ) : (
            'Start Comprehensive Security Scan'
          )}
        </Button>
      </form>
    </div>
  )
}

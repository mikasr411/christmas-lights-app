'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { Share2, Mail, Download, Eye } from 'lucide-react'

export function ShareDialog() {
  const { currentProject, currentClient } = useAppStore()
  const [sending, setSending] = useState(false)

  const sendEstimate = async () => {
    if (!currentProject || !currentClient) return

    setSending(true)
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: currentProject.id,
          clientEmail: currentClient.email,
        }),
      })

      if (response.ok) {
        // Handle success
        console.log('Estimate sent successfully')
      }
    } catch (error) {
      console.error('Failed to send estimate:', error)
    } finally {
      setSending(false)
    }
  }

  const generatePDF = async () => {
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: currentProject?.id,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `estimate-${currentProject?.id}.pdf`
        a.click()
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share & Export
        </CardTitle>
        <CardDescription>
          Send estimate to client or export files
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={sendEstimate}
          disabled={!currentProject || !currentClient || sending}
          className="w-full"
        >
          <Mail className="h-4 w-4 mr-2" />
          {sending ? 'Sending...' : 'Email Estimate to Client'}
        </Button>

        <Button 
          onClick={generatePDF}
          disabled={!currentProject}
          variant="outline"
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF Estimate
        </Button>

        <Button 
          variant="outline"
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview Client Portal
        </Button>

        {currentProject && (
          <div className="text-center text-sm text-gray-500">
            <p>Project ID: {currentProject.id}</p>
            <p>Status: {currentProject.status}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



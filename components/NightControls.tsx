'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { Moon, Sun } from 'lucide-react'

export function NightControls() {
  const { currentProject, nightIntensity, setNightIntensity, setCurrentProject } = useAppStore()
  const [processing, setProcessing] = useState(false)

  const applyNightFilter = async () => {
    if (!currentProject?.photoUrl) return

    setProcessing(true)
    try {
      const response = await fetch('/api/night', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoUrl: currentProject.photoUrl,
          intensity: nightIntensity
        }),
      })

      if (response.ok) {
        const { nightPhotoUrl } = await response.json()
        setCurrentProject({
          ...currentProject,
          nightPhotoUrl
        })
      }
    } catch (error) {
      console.error('Night filter failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5" />
          Night Mode
        </CardTitle>
        <CardDescription>
          Apply night filter to simulate evening lighting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Darkness Intensity: {nightIntensity}%
          </label>
          <Slider
            value={[nightIntensity]}
            onValueChange={([value]) => setNightIntensity(value)}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Day</span>
            <span>Night</span>
          </div>
        </div>

        <Button 
          onClick={applyNightFilter} 
          disabled={!currentProject?.photoUrl || processing}
          className="w-full"
        >
          {processing ? 'Processing...' : 'Apply Night Filter'}
        </Button>

        {currentProject?.nightPhotoUrl && (
          <div className="text-center">
            <p className="text-sm text-green-600">Night filter applied successfully</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



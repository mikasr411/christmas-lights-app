'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { Ruler, RotateCcw } from 'lucide-react'

export function MeasureTool() {
  const { currentProject, measurements, setMeasurements } = useAppStore()
  const [calibration, setCalibration] = useState({ pixels: 0, feet: 0 })
  const [isCalibrating, setIsCalibrating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCalibration = () => {
    setIsCalibrating(true)
    // Implementation for calibration mode
  }

  const calculateLinearFeet = () => {
    if (!calibration.pixels || !calibration.feet) return 0
    const pixelsPerFoot = calibration.pixels / calibration.feet
    return measurements.reduce((total, measurement) => {
      const length = Math.sqrt(
        Math.pow(measurement.endX - measurement.startX, 2) +
        Math.pow(measurement.endY - measurement.startY, 2)
      )
      return total + (length / pixelsPerFoot)
    }, 0)
  }

  const totalLinearFeet = calculateLinearFeet()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Measurements
        </CardTitle>
        <CardDescription>
          Measure rooflines and calculate linear feet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="calibration-feet">Reference Length (feet)</Label>
          <Input
            id="calibration-feet"
            type="number"
            placeholder="e.g., 36 for door width"
            value={calibration.feet || ''}
            onChange={(e) => setCalibration({ ...calibration, feet: Number(e.target.value) })}
          />
        </div>

        <Button 
          onClick={startCalibration}
          disabled={!currentProject?.photoUrl || !calibration.feet}
          className="w-full"
        >
          Start Calibration
        </Button>

        {isCalibrating && (
          <div className="text-center text-sm text-blue-600">
            Click and drag to measure the reference length
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Linear Feet:</span>
            <span className="text-lg font-bold">{totalLinearFeet.toFixed(1)} ft</span>
          </div>
          
          <div className="text-xs text-gray-500">
            {measurements.length} measurement{measurements.length !== 1 ? 's' : ''} drawn
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={() => setMeasurements([])}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear Measurements
        </Button>
      </CardContent>
    </Card>
  )
}





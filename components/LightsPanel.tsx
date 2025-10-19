'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useAppStore } from '@/lib/store'
import { Lightbulb, Palette } from 'lucide-react'

const LIGHT_TYPES = [
  { id: 'C9 Warm', name: 'C9 Warm White', price: 4.00 },
  { id: 'C9 Cool', name: 'C9 Cool White', price: 4.00 },
  { id: 'Multicolor', name: 'Multicolor', price: 5.00 },
  { id: 'Icicle', name: 'Icicle Lights', price: 6.00 },
  { id: 'Mini String', name: 'Mini String', price: 3.50 },
  { id: 'RGB Pixel', name: 'RGB Pixel', price: 10.00 },
]

const PATTERNS = [
  { id: 'solid', name: 'Solid Color' },
  { id: 'chase', name: 'Chase Pattern' },
  { id: 'alternating', name: 'Alternating' },
  { id: 'every-other', name: 'Every Other Bulb' },
]

export function LightsPanel() {
  const { selectedLightType, setSelectedLightType, pricing, setPricing } = useAppStore()
  const [bulbsPerFoot, setBulbsPerFoot] = useState(1)
  const [pattern, setPattern] = useState('solid')
  const [glow, setGlow] = useState(50)

  const selectedLight = LIGHT_TYPES.find(light => light.id === selectedLightType)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Light Configuration
        </CardTitle>
        <CardDescription>
          Choose light type and pattern
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Light Type</Label>
          <Select value={selectedLightType} onValueChange={setSelectedLightType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIGHT_TYPES.map((light) => (
                <SelectItem key={light.id} value={light.id}>
                  {light.name} - ${light.price}/ft
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pattern</Label>
          <Select value={pattern} onValueChange={setPattern}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PATTERNS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Bulbs per Foot: {bulbsPerFoot}</Label>
          <Slider
            value={[bulbsPerFoot]}
            onValueChange={([value]) => setBulbsPerFoot(value)}
            max={3}
            min={0.5}
            step={0.5}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Glow Intensity: {glow}%</Label>
          <Slider
            value={[glow]}
            onValueChange={([value]) => setGlow(value)}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        <Button className="w-full">
          <Palette className="h-4 w-4 mr-2" />
          Apply Lights to Measurements
        </Button>
      </CardContent>
    </Card>
  )
}



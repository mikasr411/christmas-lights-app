'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/lib/store'
import { Calculator, DollarSign } from 'lucide-react'

export function EstimatePanel() {
  const { measurements, pricing, selectedLightType } = useAppStore()
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  const calculateEstimate = useMemo(() => {
    const totalLinearFeet = measurements.reduce((total, measurement) => {
      const length = Math.sqrt(
        Math.pow(measurement.endX - measurement.startX, 2) +
        Math.pow(measurement.endY - measurement.startY, 2)
      )
      return total + length
    }, 0)

    const pricePerFoot = pricing.pricePerFt[selectedLightType] || 0
    const materials = totalLinearFeet * pricePerFoot
    const labor = pricing.fees.install + pricing.fees.removal
    const otherFees = pricing.fees.materials + pricing.fees.travel + pricing.fees.service
    const subtotal = materials + labor + otherFees
    const tax = subtotal * pricing.taxPct
    const grandTotal = subtotal + tax

    return {
      linearFeet: totalLinearFeet,
      materials,
      labor,
      otherFees,
      subtotal,
      tax,
      grandTotal
    }
  }, [measurements, pricing, selectedLightType])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Estimate
        </CardTitle>
        <CardDescription>
          Review pricing and generate estimate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Client Name</Label>
          <Input
            value={clientInfo.name}
            onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
            placeholder="Enter client name"
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={clientInfo.email}
            onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
            placeholder="client@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={clientInfo.phone}
            onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Input
            value={clientInfo.address}
            onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
            placeholder="123 Main St, City, State"
          />
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Linear Feet:</span>
            <span>{calculateEstimate.linearFeet.toFixed(1)} ft</span>
          </div>
          <div className="flex justify-between">
            <span>Materials ({selectedLightType}):</span>
            <span>${calculateEstimate.materials.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Labor:</span>
            <span>${calculateEstimate.labor.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Other Fees:</span>
            <span>${calculateEstimate.otherFees.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Subtotal:</span>
            <span>${calculateEstimate.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({(pricing.taxPct * 100).toFixed(2)}%):</span>
            <span>${calculateEstimate.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>${calculateEstimate.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <Button className="w-full">
          <DollarSign className="h-4 w-4 mr-2" />
          Generate Estimate
        </Button>
      </CardContent>
    </Card>
  )
}





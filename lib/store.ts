import { create } from 'zustand'

export interface Project {
  id?: string
  clientId?: string
  title: string
  photoUrl: string
  nightPhotoUrl?: string
  mockupUrl?: string
  measureJson?: any
  lightsJson?: any
  pricingJson?: any
  totalsJson?: any
  status: 'draft' | 'sent' | 'approved' | 'scheduled' | 'installed' | 'removed'
}

export interface Client {
  id?: string
  name: string
  email: string
  phone?: string
  address?: string
}

interface AppState {
  currentProject: Project | null
  currentClient: Client | null
  nightIntensity: number
  selectedLightType: string
  measurements: any[]
  pricing: any
  setCurrentProject: (project: Project | null) => void
  setCurrentClient: (client: Client | null) => void
  setNightIntensity: (intensity: number) => void
  setSelectedLightType: (type: string) => void
  setMeasurements: (measurements: any[]) => void
  setPricing: (pricing: any) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentProject: null,
  currentClient: null,
  nightIntensity: 50,
  selectedLightType: 'C9 Warm',
  measurements: [],
  pricing: {
    pricePerFt: {
      'C9 Warm': 4.00,
      'C9 Cool': 4.00,
      'Multicolor': 5.00,
      'Icicle': 6.00,
      'Mini String': 3.50,
      'RGB Pixel': 10.00
    },
    addOns: [],
    fees: {
      install: 0,
      removal: 0,
      materials: 0,
      travel: 0,
      service: 0
    },
    taxPct: 0.0875
  },
  setCurrentProject: (project) => set({ currentProject: project }),
  setCurrentClient: (client) => set({ currentClient: client }),
  setNightIntensity: (intensity) => set({ nightIntensity: intensity }),
  setSelectedLightType: (type) => set({ selectedLightType: type }),
  setMeasurements: (measurements) => set({ measurements }),
  setPricing: (pricing) => set({ pricing }),
  reset: () => set({
    currentProject: null,
    currentClient: null,
    nightIntensity: 50,
    selectedLightType: 'C9 Warm',
    measurements: [],
    pricing: {
      pricePerFt: {
        'C9 Warm': 4.00,
        'C9 Cool': 4.00,
        'Multicolor': 5.00,
        'Icicle': 6.00,
        'Mini String': 3.50,
        'RGB Pixel': 10.00
      },
      addOns: [],
      fees: {
        install: 0,
        removal: 0,
        materials: 0,
        travel: 0,
        service: 0
      },
      taxPct: 0.0875
    }
  })
}))



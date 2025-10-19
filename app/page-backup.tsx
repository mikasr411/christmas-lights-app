'use client'

import { useState, useRef } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('photo')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [nightMode, setNightMode] = useState(false)
  const [darknessIntensity, setDarknessIntensity] = useState(50)
  const [lightType, setLightType] = useState('C9 Warm White')
  const [lightPattern, setLightPattern] = useState('solid')
  const [lightColor, setLightColor] = useState('#FFD8A8')
  const [lightDensity, setLightDensity] = useState(1)
  const [lightOverlays, setLightOverlays] = useState<Array<{
    id: string
    x: number
    y: number
    width: number
    height: number
    type: string
    color: string
  }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, etc.)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setIsUploading(true)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('file', file)

      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setUploadedImage(data.url)
      alert('Image uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      const fakeEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileUpload(fakeEvent)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const applyNightMode = () => {
    if (!uploadedImage) {
      alert('Please upload an image first')
      return
    }
    setNightMode(true)
  }

  const addLightOverlay = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!uploadedImage) {
      alert('Please upload an image first')
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const newOverlay = {
      id: Date.now().toString(),
      x: x - 25, // Center the light
      y: y - 25,
      width: 50,
      height: 50,
      type: lightType,
      color: lightColor
    }
    
    setLightOverlays([...lightOverlays, newOverlay])
  }

  const removeLightOverlay = (id: string) => {
    setLightOverlays(lightOverlays.filter(overlay => overlay.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Christmas Lights Estimator</h1>
          <p className="text-gray-600">Create professional mockups and estimates for holiday lighting</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Controls</h2>
              
              {/* Simple tab buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'photo' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveTab('photo')}
                >
                  Photo
                </button>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'night' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveTab('night')}
                >
                  Night
                </button>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'measure' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveTab('measure')}
                >
                  Measure
                </button>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'lights' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveTab('lights')}
                >
                  Lights
                </button>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'estimate' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveTab('estimate')}
                >
                  Estimate
                </button>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'share' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setActiveTab('share')}
                >
                  Share
                </button>
              </div>

              {/* Tab content */}
              {activeTab === 'photo' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Upload House Photo</h3>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                        <p className="text-gray-600">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600 mb-4">Drag & drop or click to select a photo</p>
                        <button 
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                        >
                          Choose File
                        </button>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {uploadedImage && (
                    <div className="mt-4">
                      <p className="text-sm text-green-600 mb-2">✓ Image uploaded successfully!</p>
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded house" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'night' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Night Mode</h3>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Darkness Intensity: {darknessIntensity}%
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={darknessIntensity}
                      onChange={(e) => setDarknessIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={applyNightMode}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Apply Night Filter
                      </button>
                      <button 
                        onClick={() => setNightMode(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                    {nightMode && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-700">✓ Night mode applied!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'measure' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Measurements</h3>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Reference Length (feet)</label>
                    <input 
                      type="number" 
                      placeholder="e.g., 36 for door width"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
                      Start Calibration
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'lights' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Light Configuration</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Light Type</label>
                      <select 
                        value={lightType}
                        onChange={(e) => setLightType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="C9 Warm White">C9 Warm White - $4.00/ft</option>
                        <option value="C9 Cool White">C9 Cool White - $4.00/ft</option>
                        <option value="Multicolor">Multicolor - $5.00/ft</option>
                        <option value="Icicle Lights">Icicle Lights - $6.00/ft</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Pattern</label>
                      <select 
                        value={lightPattern}
                        onChange={(e) => setLightPattern(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="solid">Solid</option>
                        <option value="alternating">Alternating</option>
                        <option value="chasing">Chasing</option>
                        <option value="twinkling">Twinkling</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Color</label>
                      <input 
                        type="color" 
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Density: {lightDensity} lights per foot
                      </label>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="3" 
                        step="0.5"
                        value={lightDensity}
                        onChange={(e) => setLightDensity(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-700">
                        💡 Click on the image to place lights. Right-click to remove.
                      </p>
                    </div>
                    
                    {lightOverlays.length > 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm text-green-700">
                          ✓ {lightOverlays.length} light(s) placed
                        </p>
                        <button 
                          onClick={() => setLightOverlays([])}
                          className="text-xs text-red-600 hover:text-red-800 mt-1"
                        >
                          Clear all lights
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'estimate' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Estimate</h3>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Client Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input 
                      type="email" 
                      placeholder="Client Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between">
                        <span>Total Linear Feet:</span>
                        <span>0.0 ft</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>$0.00</span>
                      </div>
                    </div>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors">
                      Generate Estimate
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'share' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Share & Export</h3>
                  <div className="space-y-2">
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
                      Email Estimate to Client
                    </button>
                    <button className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
                      Download PDF Estimate
                    </button>
                    <button className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors">
                      Preview Client Portal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Canvas Preview */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div 
              className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative cursor-crosshair"
              onClick={addLightOverlay}
              onContextMenu={(e) => {
                e.preventDefault()
                // Right-click to remove lights (simplified for now)
                if (lightOverlays.length > 0) {
                  setLightOverlays(lightOverlays.slice(0, -1))
                }
              }}
            >
              {uploadedImage ? (
                <>
                  <img 
                    src={uploadedImage} 
                    alt="House preview" 
                    className={`w-full h-full object-cover ${nightMode ? 'brightness-50 contrast-125' : ''}`}
                    style={{
                      filter: nightMode ? `brightness(${100 - darknessIntensity}%) contrast(125%)` : 'none'
                    }}
                  />
                  
                  {/* Light Overlays */}
                  {lightOverlays.map((overlay) => (
                    <div
                      key={overlay.id}
                      className="absolute pointer-events-none"
                      style={{
                        left: overlay.x,
                        top: overlay.y,
                        width: overlay.width,
                        height: overlay.height,
                      }}
                    >
                      <div
                        className="w-full h-full rounded-full animate-pulse"
                        style={{
                          backgroundColor: overlay.color,
                          boxShadow: `0 0 20px ${overlay.color}, 0 0 40px ${overlay.color}`,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  ))}
                  
                  {/* Night mode indicator */}
                  {nightMode && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      Night Mode ({darknessIntensity}%)
                    </div>
                  )}
                  
                  {/* Light count indicator */}
                  {lightOverlays.length > 0 && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      {lightOverlays.length} Light{lightOverlays.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-lg">Upload a photo to get started</p>
                  <p className="text-sm">Supported formats: JPG, PNG</p>
                </div>
              )}
            </div>
            
            {/* Instructions */}
            {uploadedImage && (
              <div className="mt-3 text-xs text-gray-600 text-center">
                <p>Click to add lights • Right-click to remove last light</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



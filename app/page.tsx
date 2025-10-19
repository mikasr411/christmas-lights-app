'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [nightMode, setNightMode] = useState(false)
  const [darknessIntensity, setDarknessIntensity] = useState(70)
  const [lightType, setLightType] = useState('C9 Warm')
  const [lightColor, setLightColor] = useState('#FFD8A8')
  const [lightDensity, setLightDensity] = useState(1)
  const [lightGlow, setLightGlow] = useState(50)
  const [lightOverlays, setLightOverlays] = useState<Array<{id: string, x: number, y: number, type: string, color: string, size?: number}>>([])
  const [decorations, setDecorations] = useState<Array<{id: string, x: number, y: number, type: string, color: string, size: number}>>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null)
  const [lightSpacing, setLightSpacing] = useState(15) // pixels between lights
  const [isSaving, setIsSaving] = useState(false)
  const [isStraightLine, setIsStraightLine] = useState(false)
  const [colorPattern, setColorPattern] = useState<string[]>(['#FFD8A8'])
  const [patternMode, setPatternMode] = useState<'single' | 'alternating' | 'random'>('single')
  const [straightLineEnd, setStraightLineEnd] = useState<{x: number, y: number} | null>(null)
  const [decorationType, setDecorationType] = useState('wreath')
  const [decorationSize, setDecorationSize] = useState(100) // percentage scale
  const [decorationMode, setDecorationMode] = useState(false) // toggle for decoration mode
  const [deleteMode, setDeleteMode] = useState(false) // toggle for delete mode
  const [isDeleting, setIsDeleting] = useState(false) // currently deleting
  const [deleteStart, setDeleteStart] = useState<{x: number, y: number} | null>(null)
  const [deleteEnd, setDeleteEnd] = useState<{x: number, y: number} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY
    
    // Validate coordinates
    if (!isFinite(x) || !isFinite(y) || isNaN(x) || isNaN(y)) {
      console.warn('Invalid canvas coordinates:', { x, y, clientX: event.clientX, clientY: event.clientY })
      return { x: 0, y: 0 }
    }
    
    return { x, y }
  }

  const getImageCoordinates = (canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    // Get the image element to calculate the actual image position within the canvas
    const img = canvas.parentElement?.querySelector('img')
    if (!img) return { x: canvasX, y: canvasY }
    
    const canvasRect = canvas.getBoundingClientRect()
    const imgRect = img.getBoundingClientRect()
    
    // Validate image dimensions
    if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth === 0 || img.naturalHeight === 0) {
      return { x: canvasX, y: canvasY }
    }
    
    // For object-fit: contain, calculate the actual image dimensions within the container
    const containerAspect = canvasRect.width / canvasRect.height
    const imageAspect = img.naturalWidth / img.naturalHeight
    
    let displayWidth, displayHeight, offsetX, offsetY
    
    if (imageAspect > containerAspect) {
      // Image is wider than container - fit to width
      displayWidth = canvasRect.width
      displayHeight = canvasRect.width / imageAspect
      offsetX = 0
      offsetY = (canvasRect.height - displayHeight) / 2
    } else {
      // Image is taller than container - fit to height
      displayHeight = canvasRect.height
      displayWidth = canvasRect.height * imageAspect
      offsetX = (canvasRect.width - displayWidth) / 2
      offsetY = 0
    }
    
    // Calculate the scale factor between the displayed image and the natural image
    const scaleX = img.naturalWidth / displayWidth
    const scaleY = img.naturalHeight / displayHeight
    
    // Convert canvas coordinates to image coordinates
    const relativeX = canvasX - offsetX * (canvas.width / canvasRect.width)
    const relativeY = canvasY - offsetY * (canvas.height / canvasRect.height)
    
    const imageX = relativeX * scaleX
    const imageY = relativeY * scaleY
    
    // Validate final coordinates
    if (!isFinite(imageX) || !isFinite(imageY) || isNaN(imageX) || isNaN(imageY)) {
      console.warn('Invalid coordinate conversion:', { canvasX, canvasY, imageX, imageY })
      return { x: 0, y: 0 }
    }
    
    return { x: imageX, y: imageY }
  }

  const getNextColor = (index: number) => {
    if (patternMode === 'single' || colorPattern.length === 1) {
      return colorPattern[0]
    } else if (patternMode === 'alternating') {
      return colorPattern[index % colorPattern.length]
    } else if (patternMode === 'random') {
      return colorPattern[Math.floor(Math.random() * colorPattern.length)]
    }
    return colorPattern[0]
  }

  const isPointInLight = (point: {x: number, y: number}, light: {x: number, y: number, type: string}) => {
    const distance = Math.sqrt(Math.pow(point.x - light.x, 2) + Math.pow(point.y - light.y, 2))
    // Different hit areas for different light types
    const hitRadius = light.type === 'wreath' ? 12 : 
                     light.type === 'bow' ? 8 :
                     light.type === 'c9' ? 8 :
                     light.type === 'govee' ? 6 :
                     light.type === 'rope' ? 7 :
                     light.type === 'mini' ? 3 : 4
    return distance <= hitRadius
  }

  const isPointInDecoration = (point: {x: number, y: number}, decoration: {x: number, y: number, type: string, size: number}) => {
    const scale = decoration.size / 100
    const hitRadius = decoration.type === 'wreath' ? 12 * scale : 8 * scale
    const distance = Math.sqrt(Math.pow(point.x - decoration.x, 2) + Math.pow(point.y - decoration.y, 2))
    return distance <= hitRadius
  }

  const deleteLightsInArea = (start: {x: number, y: number}, end: {x: number, y: number}) => {
    const minX = Math.min(start.x, end.x)
    const maxX = Math.max(start.x, end.x)
    const minY = Math.min(start.y, end.y)
    const maxY = Math.max(start.y, end.y)

    // Delete lights in the selection area
    setLightOverlays(prev => prev.filter(light => 
      light.x < minX || light.x > maxX || light.y < minY || light.y > maxY
    ))

    // Delete decorations in the selection area
    setDecorations(prev => prev.filter(decoration => 
      decoration.x < minX || decoration.x > maxX || decoration.y < minY || decoration.y > maxY
    ))
  }

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return
    
    const canvasCoords = getCanvasCoordinates(event)
    const imageCoords = getImageCoordinates(canvasCoords.x, canvasCoords.y)
    
    if (deleteMode) {
      // Start deletion mode
      event.preventDefault()
      console.log('Delete mode - starting deletion at:', imageCoords)
      setIsDeleting(true)
      setDeleteStart(imageCoords)
      setDeleteEnd(imageCoords)
    } else if (isDrawing) {
      // Normal light drawing
      setIsDragging(true)
      setDragStart(imageCoords)
      setIsStraightLine(event.shiftKey) // Check if Shift is held for straight lines
    }
  }

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return
    
    const canvasCoords = getCanvasCoordinates(event)
    let imageCoords = getImageCoordinates(canvasCoords.x, canvasCoords.y)
    
    if (deleteMode && isDeleting) {
      // Update deletion area
      event.preventDefault()
      console.log('Delete mode - updating end point:', imageCoords)
      setDeleteEnd(imageCoords)
    } else if (isDrawing && isDragging && dragStart) {
      // Normal light drawing
      // Update straight line end point for preview
      if (isStraightLine) {
        setStraightLineEnd(imageCoords)
      }
      
      const distance = Math.sqrt(Math.pow(imageCoords.x - dragStart.x, 2) + Math.pow(imageCoords.y - dragStart.y, 2))
      
      if (distance >= lightSpacing) {
        // Calculate how many lights to add based on spacing
        const numLights = Math.floor(distance / lightSpacing)
        const newLights: Array<{id: string, x: number, y: number, type: string, color: string}> = []
        
        for (let i = 1; i <= numLights; i++) {
          const ratio = (i * lightSpacing) / distance
          const x = dragStart.x + (imageCoords.x - dragStart.x) * ratio
          const y = dragStart.y + (imageCoords.y - dragStart.y) * ratio
          
          newLights.push({
            id: `${Date.now()}-${i}`,
            x: x,
            y: y,
            type: lightType,
            color: getNextColor(lightOverlays.length + i - 1)
          })
        }
        
        setLightOverlays(prev => [...prev, ...newLights])
        setDragStart(imageCoords) // Update start point for next segment
      }
    }
  }

  const handleCanvasMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return
    
    const canvasCoords = getCanvasCoordinates(event)
    let imageCoords = getImageCoordinates(canvasCoords.x, canvasCoords.y)
    
    if (deleteMode && isDeleting && deleteStart) {
      // Handle deletion
      event.preventDefault()
      console.log('Delete mode - handling deletion at:', imageCoords)
      if (deleteEnd) {
        // Check if it's a single click (small area) or drag (larger area)
        const distance = Math.sqrt(Math.pow(imageCoords.x - deleteStart.x, 2) + Math.pow(imageCoords.y - deleteStart.y, 2))
        console.log('Delete distance:', distance)
        
        if (distance < 10) {
          // Single click - delete individual lights/decorations
          const clickPoint = { x: imageCoords.x, y: imageCoords.y }
          console.log('Single click deletion at:', clickPoint)
          
          // Delete individual lights
          setLightOverlays(prev => {
            const filtered = prev.filter(light => !isPointInLight(clickPoint, light))
            console.log('Lights before:', prev.length, 'after:', filtered.length)
            return filtered
          })
          
          // Delete individual decorations
          setDecorations(prev => {
            const filtered = prev.filter(decoration => !isPointInDecoration(clickPoint, decoration))
            console.log('Decorations before:', prev.length, 'after:', filtered.length)
            return filtered
          })
        } else {
          // Drag - delete all lights/decorations in area
          console.log('Drag deletion from:', deleteStart, 'to:', imageCoords)
          deleteLightsInArea(deleteStart, imageCoords)
        }
      }
      
      setIsDeleting(false)
      setDeleteStart(null)
      setDeleteEnd(null)
    } else if (isDrawing) {
      // Normal light drawing
      if (isDragging) {
        if (isStraightLine && dragStart) {
          // For straight lines, place lights along the entire straight line from start to end
          const distance = Math.sqrt(Math.pow(imageCoords.x - dragStart.x, 2) + Math.pow(imageCoords.y - dragStart.y, 2))
          const numLights = Math.floor(distance / lightSpacing)
          const newLights: Array<{id: string, x: number, y: number, type: string, color: string}> = []
          
          for (let i = 0; i <= numLights; i++) {
            const ratio = i / numLights
            const x = dragStart.x + (imageCoords.x - dragStart.x) * ratio
            const y = dragStart.y + (imageCoords.y - dragStart.y) * ratio
            
            newLights.push({
              id: `${Date.now()}-${i}`,
              x: x,
              y: y,
              type: lightType,
              color: getNextColor(lightOverlays.length + i)
            })
          }
          
          setLightOverlays(prev => [...prev, ...newLights])
        } else {
          // Regular drag - add final light if needed
          const newLight = {
            id: Date.now().toString(),
            x: imageCoords.x,
            y: imageCoords.y,
            type: lightType,
            color: getNextColor(lightOverlays.length)
          }
          setLightOverlays(prev => [...prev, newLight])
        }
      } else {
        // Single click - add one light
        const newLight = {
          id: Date.now().toString(),
          x: imageCoords.x,
          y: imageCoords.y,
          type: lightType,
          color: getNextColor(lightOverlays.length)
        }
        setLightOverlays(prev => [...prev, newLight])
      }
      
      setIsDragging(false)
      setDragStart(null)
      setIsStraightLine(false)
      setStraightLineEnd(null)
    }
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return
    
    // Only add decorations if decoration mode is enabled and not in drawing or delete mode
    if (decorationMode && !isDrawing && !deleteMode) {
      const canvasCoords = getCanvasCoordinates(event)
      const imageCoords = getImageCoordinates(canvasCoords.x, canvasCoords.y)
      
      // Add decoration on click
      const newDecoration = {
        id: Date.now().toString(),
        x: imageCoords.x,
        y: imageCoords.y,
        type: decorationType,
        color: decorationType === 'bow' ? '#dc2626' : lightColor,
        size: decorationSize
      }
      setDecorations(prev => [...prev, newDecoration])
    }
  }

  const clearLights = () => {
    setLightOverlays([])
    setDecorations([])
  }

  const saveMockup = async () => {
    if (!uploadedImage || !canvasRef.current || isSaving) return

    setIsSaving(true)
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Create a new canvas for the final image
      const finalCanvas = document.createElement('canvas')
      const finalCtx = finalCanvas.getContext('2d')
      if (!finalCtx) return

      // Set canvas size to match the image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        finalCanvas.width = img.width
        finalCanvas.height = img.height

        // Draw the original image
        finalCtx.drawImage(img, 0, 0)

        // Apply night mode filter if enabled
        if (nightMode) {
          const imageData = finalCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height)
          const data = imageData.data
          
          for (let i = 0; i < data.length; i += 4) {
            // Apply brightness
            const brightness = 1 - darknessIntensity / 100
            data[i] = data[i] * brightness     // Red
            data[i + 1] = data[i + 1] * brightness // Green
            data[i + 2] = data[i + 2] * brightness // Blue
            
            // Apply contrast
            const contrast = 1 + darknessIntensity / 200
            data[i] = ((data[i] - 128) * contrast) + 128
            data[i + 1] = ((data[i + 1] - 128) * contrast) + 128
            data[i + 2] = ((data[i + 2] - 128) * contrast) + 128
            
            // Apply saturation
            data[i] = data[i] * 0.8
            data[i + 1] = data[i + 1] * 0.8
            data[i + 2] = data[i + 2] * 0.8
          }
          
          finalCtx.putImageData(imageData, 0, 0)
        }

        // Draw lights on the final canvas
        lightOverlays.forEach(light => {
          // Scale the light size based on image dimensions
          const scale = Math.max(finalCanvas.width, finalCanvas.height) / 1000
          
          // Draw glow effect (scale based on image size)
          const glowSize = 20 * scale
          const glowGradient = finalCtx.createRadialGradient(light.x, light.y, 0, light.x, light.y, glowSize)
          glowGradient.addColorStop(0, light.color + '80')
          glowGradient.addColorStop(0.5, light.color + '40')
          glowGradient.addColorStop(1, light.color + '00')
          
          finalCtx.fillStyle = glowGradient
          finalCtx.beginPath()
          finalCtx.arc(light.x, light.y, glowSize, 0, 2 * Math.PI)
          finalCtx.fill()
          
          // Draw the light using the drawLight function with scaled coordinates
          finalCtx.save()
          finalCtx.scale(scale, scale)
          drawLight(finalCtx, { ...light, x: light.x / scale, y: light.y / scale })
          finalCtx.restore()
        })

        // Draw decorations on the final canvas using the drawDecoration function
        decorations.forEach(decoration => {
          // Scale the decoration size based on image dimensions
          const scale = Math.max(finalCanvas.width, finalCanvas.height) / 1000
          
          // Draw decoration using the drawDecoration function with scaled coordinates
          finalCtx.save()
          finalCtx.scale(scale, scale)
          drawDecoration(finalCtx, { ...decoration, x: decoration.x / scale, y: decoration.y / scale })
          finalCtx.restore()
        })

        // Convert to blob and download
        finalCanvas.toBlob((blob) => {
          if (!blob) return
          
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `christmas-lights-mockup-${Date.now()}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          alert('Mockup saved successfully!')
        }, 'image/png')
      }

      img.src = uploadedImage
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save mockup. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const drawDecoration = (ctx: CanvasRenderingContext2D, decoration: {x: number, y: number, type: string, color: string, size: number}) => {
    const { x, y, type, color, size } = decoration
    const scale = size / 100 // Convert percentage to scale factor
    
    // Validate coordinates - skip drawing if invalid
    if (!isFinite(x) || !isFinite(y) || isNaN(x) || isNaN(y)) {
      console.warn('Invalid decoration coordinates:', { x, y, type, color, size })
      return
    }
    
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(scale, scale)
    
    if (type === 'wreath') {
      // Draw wreath base (dark green circle)
      ctx.fillStyle = '#2d5016'
      ctx.beginPath()
      ctx.arc(0, 0, 12, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw wreath inner circle (lighter green)
      ctx.fillStyle = '#4a7c59'
      ctx.beginPath()
      ctx.arc(0, 0, 10, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw small lights inside the wreath
      const lightPositions = [
        { x: -3, y: -3 },
        { x: 3, y: -3 },
        { x: -3, y: 3 },
        { x: 3, y: 3 },
        { x: 0, y: -6 },
        { x: -6, y: 0 },
        { x: 6, y: 0 },
        { x: 0, y: 6 }
      ]
      
      lightPositions.forEach(pos => {
        // Light glow
        ctx.fillStyle = color + '60'
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2)
        ctx.fill()
        
        // Light bulb
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      })
      
      // Add some pine needles texture
      ctx.strokeStyle = '#1a3d0a'
      ctx.lineWidth = 1
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8
        const startX = Math.cos(angle) * 8
        const startY = Math.sin(angle) * 8
        const endX = Math.cos(angle) * 12
        const endY = Math.sin(angle) * 12
        
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }
    } else if (type === 'bow') {
      // Red bow decoration
      // Main bow body
      ctx.fillStyle = '#dc2626'
      ctx.beginPath()
      ctx.ellipse(-3, -2, 4, 2, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(3, -2, 4, 2, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Bow center
      ctx.fillStyle = '#991b1b'
      ctx.beginPath()
      ctx.arc(0, 0, 1.5, 0, Math.PI * 2)
      ctx.fill()
      
      // Bow tails
      ctx.strokeStyle = '#dc2626'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-6, 1)
      ctx.quadraticCurveTo(-8, 4, -6, 6)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(6, 1)
      ctx.quadraticCurveTo(8, 4, 6, 6)
      ctx.stroke()
      
      // Bow highlights
      ctx.fillStyle = '#fca5a5'
      ctx.beginPath()
      ctx.ellipse(-2, -3, 2, 1, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(2, -3, 2, 1, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.restore()
  }

  const drawLight = (ctx: CanvasRenderingContext2D, light: {x: number, y: number, type: string, color: string}) => {
    const { x, y, type, color } = light
    
    // Validate coordinates - skip drawing if invalid
    if (!isFinite(x) || !isFinite(y) || isNaN(x) || isNaN(y)) {
      console.warn('Invalid light coordinates:', { x, y, type, color })
      return
    }
    
    // Draw glow effect
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 20)
    glowGradient.addColorStop(0, color + '80')
    glowGradient.addColorStop(0.5, color + '40')
    glowGradient.addColorStop(1, color + '00')
    
    ctx.fillStyle = glowGradient
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, 2 * Math.PI)
    ctx.fill()
    
    // Draw light based on type
    switch (type) {
      case 'c9':
        // C9 Bulbs - Cone/Pinecone shape (2.5" length, distinctive cone shape)
        ctx.fillStyle = color
        ctx.beginPath()
        // Draw cone shape (pinecone/strawberry shape)
        ctx.moveTo(x, y - 8) // Top point
        ctx.lineTo(x - 4, y + 2) // Left side
        ctx.lineTo(x - 2, y + 6) // Left base
        ctx.lineTo(x + 2, y + 6) // Right base
        ctx.lineTo(x + 4, y + 2) // Right side
        ctx.closePath()
        ctx.fill()
        // Add faceted surface lines for sparkle effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, y - 8)
        ctx.lineTo(x, y + 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x - 2, y - 4)
        ctx.lineTo(x + 2, y + 4)
        ctx.stroke()
        // Add bulb base (E17 intermediate base)
        ctx.fillStyle = '#333'
        ctx.beginPath()
        ctx.arc(x, y + 6, 2.5, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'icicle':
        // Icicle Lights - actual icicle shape with drops
        ctx.fillStyle = color
        // Main icicle body
        ctx.beginPath()
        ctx.moveTo(x, y - 8)
        ctx.lineTo(x - 1.5, y + 2)
        ctx.lineTo(x + 1.5, y + 2)
        ctx.closePath()
        ctx.fill()
        // Icicle drops
        ctx.beginPath()
        ctx.arc(x, y - 1, 1.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y + 3, 0.8, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y + 6, 0.5, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'govee':
        // Govee RGBIC - Distinctive smart lighting with color zones
        // Main LED strip body
        ctx.fillStyle = color
        ctx.fillRect(x - 5, y - 1, 10, 2)
        // Add RGBIC color zones (multiple colors in one strip)
        const colors = [color, '#ff00ff', '#00ffff', '#ffff00']
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = colors[i]
          ctx.fillRect(x - 5 + (i * 2.5), y - 1, 2.5, 2)
        }
        // Add smart lighting glow effect
        ctx.strokeStyle = color + '60'
        ctx.lineWidth = 3
        ctx.strokeRect(x - 5, y - 1, 10, 2)
        // Add control chip indicator
        ctx.fillStyle = '#000'
        ctx.fillRect(x - 1, y - 0.5, 2, 1)
        break
      case 'rope':
        // Rope Lights - Flexible PVC tube with small lights inside
        // PVC tube casing
        ctx.fillStyle = 'rgba(200, 200, 200, 0.8)'
        ctx.fillRect(x - 6, y - 2, 12, 4)
        // Small lights inside the tube
        ctx.fillStyle = color
        for (let i = 0; i < 3; i++) {
          ctx.beginPath()
          ctx.arc(x - 4 + (i * 4), y, 1.2, 0, Math.PI * 2)
          ctx.fill()
        }
        // PVC tube shine
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.lineWidth = 1
        ctx.strokeRect(x - 6, y - 2, 12, 4)
        break
      case 'mini':
        // Mini Lights - Small traditional Christmas lights
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fill()
        // Small base
        ctx.fillStyle = '#333'
        ctx.beginPath()
        ctx.arc(x, y + 2.5, 1, 0, Math.PI * 2)
        ctx.fill()
        break
      case 'rgb-pixel':
        // RGB Pixel - Square/rectangular LED
        ctx.fillStyle = color
        ctx.fillRect(x - 3, y - 3, 6, 6)
        // Add corner highlights for LED effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.fillRect(x - 3, y - 3, 1, 1)
        ctx.fillRect(x + 2, y - 3, 1, 1)
        ctx.fillRect(x - 3, y + 2, 1, 1)
        ctx.fillRect(x + 2, y + 2, 1, 1)
        break
      case 'multicolor':
        // Multicolor - Mixed color bulb
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
        // Add color variation effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.beginPath()
        ctx.arc(x - 1, y - 1, 1, 0, Math.PI * 2)
        ctx.fill()
        // Base
        ctx.fillStyle = '#333'
        ctx.beginPath()
        ctx.arc(x, y + 4, 1.5, 0, Math.PI * 2)
        ctx.fill()
        break
      default:
        // Default light
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
    }
    
    // Add sparkle effect for certain light types
    if (type === 'c9' || type === 'mini' || type === 'multicolor') {
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(x - 1, y - 1)
      ctx.lineTo(x + 1, y + 1)
      ctx.moveTo(x + 1, y - 1)
      ctx.lineTo(x - 1, y + 1)
      ctx.stroke()
    }
  }

  const renderLights = () => {
    const canvas = canvasRef.current
    if (!canvas || !uploadedImage) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Get the image element to calculate coordinate conversion
    const img = canvas.parentElement?.querySelector('img')
    if (!img) return
    
    const canvasRect = canvas.getBoundingClientRect()
    
    // For object-fit: contain, calculate the actual image dimensions within the container
    const containerAspect = canvasRect.width / canvasRect.height
    const imageAspect = img.naturalWidth / img.naturalHeight
    
    let displayWidth, displayHeight, offsetX, offsetY
    
    if (imageAspect > containerAspect) {
      // Image is wider than container - fit to width
      displayWidth = canvasRect.width
      displayHeight = canvasRect.width / imageAspect
      offsetX = 0
      offsetY = (canvasRect.height - displayHeight) / 2
    } else {
      // Image is taller than container - fit to height
      displayHeight = canvasRect.height
      displayWidth = canvasRect.height * imageAspect
      offsetX = (canvasRect.width - displayWidth) / 2
      offsetY = 0
    }
    
    // Calculate the scale factor between the displayed image and the natural image
    const scaleX = displayWidth / img.naturalWidth
    const scaleY = displayHeight / img.naturalHeight
    
    // Draw straight line preview if in straight line mode
    if (isStraightLine && isDragging && dragStart && straightLineEnd) {
      const startCanvasX = (dragStart.x * scaleX) + (offsetX * (canvas.width / canvasRect.width))
      const startCanvasY = (dragStart.y * scaleY) + (offsetY * (canvas.height / canvasRect.height))
      const endCanvasX = (straightLineEnd.x * scaleX) + (offsetX * (canvas.width / canvasRect.width))
      const endCanvasY = (straightLineEnd.y * scaleY) + (offsetY * (canvas.height / canvasRect.height))
      
      // Draw preview line
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(startCanvasX, startCanvasY)
      ctx.lineTo(endCanvasX, endCanvasY)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Draw deletion area if in delete mode
    if (deleteMode && isDeleting && deleteStart && deleteEnd) {
      const startCanvasX = (deleteStart.x * scaleX) + (offsetX * (canvas.width / canvasRect.width))
      const startCanvasY = (deleteStart.y * scaleY) + (offsetY * (canvas.height / canvasRect.height))
      const endCanvasX = (deleteEnd.x * scaleX) + (offsetX * (canvas.width / canvasRect.width))
      const endCanvasY = (deleteEnd.y * scaleY) + (offsetY * (canvas.height / canvasRect.height))
      
      const minX = Math.min(startCanvasX, endCanvasX)
      const maxX = Math.max(startCanvasX, endCanvasX)
      const minY = Math.min(startCanvasY, endCanvasY)
      const maxY = Math.max(startCanvasY, endCanvasY)
      
      // Draw deletion rectangle
      ctx.fillStyle = 'rgba(220, 38, 38, 0.2)'
      ctx.fillRect(minX, minY, maxX - minX, maxY - minY)
      
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY)
      ctx.setLineDash([])
    }

    // Draw all lights
    lightOverlays.forEach(light => {
      // Convert image coordinates back to canvas coordinates for display
      const canvasX = (light.x * scaleX) + (offsetX * (canvas.width / canvasRect.width))
      const canvasY = (light.y * scaleY) + (offsetY * (canvas.height / canvasRect.height))
      
      // Validate converted coordinates
      if (isFinite(canvasX) && isFinite(canvasY) && !isNaN(canvasX) && !isNaN(canvasY)) {
        drawLight(ctx, { ...light, x: canvasX, y: canvasY })
      } else {
        console.warn('Skipping light with invalid canvas coordinates:', { light, canvasX, canvasY })
      }
    })

    // Draw all decorations
    decorations.forEach(decoration => {
      // Convert image coordinates back to canvas coordinates for display
      const canvasX = (decoration.x * scaleX) + (offsetX * (canvas.width / canvasRect.width))
      const canvasY = (decoration.y * scaleY) + (offsetY * (canvas.height / canvasRect.height))
      
      // Validate converted coordinates
      if (isFinite(canvasX) && isFinite(canvasY) && !isNaN(canvasX) && !isNaN(canvasY)) {
        drawDecoration(ctx, { ...decoration, x: canvasX, y: canvasY })
      } else {
        console.warn('Skipping decoration with invalid canvas coordinates:', { decoration, canvasX, canvasY })
      }
    })
  }

  // Set canvas size and re-render lights when overlays change
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas && uploadedImage) {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    renderLights()
  }, [lightOverlays, lightType, uploadedImage, isStraightLine, isDragging, dragStart, straightLineEnd, decorations, decorationType, decorationSize, deleteMode, isDeleting, deleteStart, deleteEnd])

  // Re-render lights when canvas size changes
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas && uploadedImage) {
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
        renderLights()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [uploadedImage])

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: 'Arial, sans-serif' }}>
      {/* Main Content Area - Full Height */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Main Preview Area */}
        <div style={{ flex: 1, padding: '20px' }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            height: '100%',
            overflow: 'hidden'
          }}>
            {uploadedImage ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img 
                  src={uploadedImage} 
                  alt="House preview" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    filter: nightMode ? `brightness(${1 - darknessIntensity / 100}) contrast(${1 + darknessIntensity / 200}) saturate(0.8)` : 'none',
                    transition: 'filter 0.3s ease'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onClick={handleCanvasClick}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    cursor: isDrawing ? (isDragging ? 'crosshair' : 'crosshair') : 
                             (decorationMode ? 'pointer' : 
                             (deleteMode ? 'crosshair' : 'default')),
                    zIndex: 10
                  }}
                />
              </div>
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#666',
                textAlign: 'center'
              }}>
                <div>
                  <p style={{ fontSize: '18px', marginBottom: '10px' }}>Upload a photo to get started</p>
                  <p style={{ fontSize: '14px' }}>Drag & drop or click to browse</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Controls */}
        <div style={{ 
          width: '320px', 
          backgroundColor: '#f8f9fa', 
          borderLeft: '1px solid #e5e7eb',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <h1 style={{ color: '#333', margin: '0 0 15px 0', fontSize: '18px' }}>Christmas Lights Estimator</h1>
              
              {/* Upload Section */}
              <div 
                style={{
                  border: '2px dashed #ccc',
                  borderRadius: '8px',
                  padding: '15px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isUploading ? '#f9f9f9' : '#fafafa',
                  marginBottom: '15px'
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      border: '3px solid #f3f3f3',
                      borderTop: '3px solid #3498db',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 8px'
                    }}></div>
                    <p style={{ color: '#666', margin: 0, fontSize: '12px' }}>Uploading...</p>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#666', margin: '0 0 8px 0', fontSize: '12px' }}>Upload Photo</p>
                    <button style={{
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}>
                      Choose File
                    </button>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Night Mode Controls */}
            {uploadedImage && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>🌙 Night Mode</h3>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    id="nightMode"
                    checked={nightMode}
                    onChange={(e) => setNightMode(e.target.checked)}
                    style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                  />
                  <label htmlFor="nightMode" style={{ color: '#333', fontWeight: '500', cursor: 'pointer' }}>
                    Enable Night Mode
                  </label>
                </div>
                
                {nightMode && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ color: '#666', fontSize: '14px' }}>
                        Darkness: {darknessIntensity}%
                      </label>
                      <button
                        onClick={() => {
                          setNightMode(false)
                          setDarknessIntensity(70)
                        }}
                        style={{
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Reset
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={darknessIntensity}
                      onChange={(e) => setDarknessIntensity(Number(e.target.value))}
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        background: '#ddd',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Light Controls */}
            {uploadedImage && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>🎄 Light Controls</h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                    Light Type
                  </label>
                  <select
                    value={lightType}
                    onChange={(e) => setLightType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="c9">C9 Bulbs (Cone/Pinecone)</option>
                    <option value="icicle">Icicle Lights</option>
                    <option value="govee">Govee RGBIC</option>
                    <option value="rope">Rope Lights (PVC Tube)</option>
                    <option value="mini">Mini Lights</option>
                    <option value="rgb-pixel">RGB Pixel</option>
                    <option value="multicolor">Multicolor</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                    Color
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#ffa500'].map(color => (
                      <button
                        key={color}
                        onClick={() => setLightColor(color)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: lightColor === color ? '3px solid #333' : '2px solid #ddd',
                          backgroundColor: color,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                    Color Pattern
                  </label>
                  <select
                    value={patternMode}
                    onChange={(e) => setPatternMode(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      marginBottom: '10px'
                    }}
                  >
                    <option value="single">Single Color</option>
                    <option value="alternating">Alternating</option>
                    <option value="random">Random</option>
                  </select>
                  
                  {patternMode !== 'single' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                      {colorPattern.map((color, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <button
                            onClick={() => {
                              const newPattern = [...colorPattern]
                              newPattern[index] = lightColor
                              setColorPattern(newPattern)
                            }}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: colorPattern[index] === lightColor ? '2px solid #333' : '1px solid #ddd',
                              backgroundColor: color,
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          />
                          {index < colorPattern.length - 1 && (
                            <button
                              onClick={() => {
                                const newPattern = colorPattern.filter((_, i) => i !== index)
                                setColorPattern(newPattern)
                              }}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#dc3545',
                                cursor: 'pointer',
                                fontSize: '12px',
                                padding: '0',
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      {colorPattern.length < 6 && (
                        <button
                          onClick={() => setColorPattern([...colorPattern, lightColor])}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '2px dashed #999',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            fontSize: '12px'
                          }}
                        >
                          +
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                    Spacing: {lightSpacing}px
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={lightSpacing}
                    onChange={(e) => setLightSpacing(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#ddd',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#666' }}>
                    <input
                      type="checkbox"
                      checked={isStraightLine}
                      onChange={(e) => setIsStraightLine(e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    📏 Straight Line Mode
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <button
                    onClick={clearLights}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsDrawing(!isDrawing)}
                    style={{
                      backgroundColor: isDrawing ? '#28a745' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  {lightOverlays.length} lights, {decorations.length} decorations
                </div>
              </div>
            )}

            {/* Holiday Decorations */}
            {uploadedImage && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>🎁 Decorations</h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                    Decoration Type
                  </label>
                  <select
                    value={decorationType}
                    onChange={(e) => setDecorationType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="wreath">Wreath with Lights</option>
                    <option value="bow">Red Bow</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px' }}>
                    Size: {decorationSize}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={decorationSize}
                    onChange={(e) => setDecorationSize(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#ddd',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <button
                    onClick={() => setDecorationMode(!decorationMode)}
                    style={{
                      backgroundColor: decorationMode ? '#28a745' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    {decorationMode ? 'Stop Adding' : 'Add Decorations'}
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                  Click on the image to place decorations
                </div>
              </div>
            )}

            {/* Delete Tools */}
            {uploadedImage && (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#dc2626', fontSize: '16px' }}>🗑️ Delete Tools</h3>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <button
                    onClick={() => {
                      console.log('Toggling delete mode from', deleteMode, 'to', !deleteMode)
                      setDeleteMode(!deleteMode)
                    }}
                    style={{
                      backgroundColor: deleteMode ? '#dc2626' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    {deleteMode ? 'Delete Mode ON' : 'Enable Delete Mode'}
                  </button>
                </div>

                <div style={{ fontSize: '12px', color: '#dc2626', textAlign: 'center' }}>
                  {deleteMode ? 
                    'Click individual lights to delete them, or drag to delete multiple' : 
                    'Enable delete mode above to start removing lights and decorations'
                  }
                </div>
              </div>
            )}

            {/* Instructions */}
            {uploadedImage && (
              <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', border: '1px solid #bbdefb' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1976d2', fontSize: '14px' }}>💡 How to use:</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#1976d2', lineHeight: '1.4' }}>
                  <li>Enable Drawing Mode to add lights by clicking or dragging</li>
                  <li>Hold Shift while dragging for straight lines</li>
                  <li>Select multiple colors for patterns (alternating/random)</li>
                  <li>Enable Decoration Mode to add wreaths and bows</li>
                  <li>Enable Delete Mode to remove lights and decorations</li>
                  <li>Adjust spacing and size with the sliders</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {uploadedImage && (
        <div style={{ 
          backgroundColor: 'white', 
          borderTop: '1px solid #e5e7eb',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {lightOverlays.length} lights, {decorations.length} decorations
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={saveMockup}
              disabled={!uploadedImage || lightOverlays.length === 0 || isSaving}
              style={{
                backgroundColor: (lightOverlays.length > 0 && !isSaving) ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: (lightOverlays.length > 0 && !isSaving) ? 'pointer' : 'not-allowed',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isSaving ? (
                <>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save Mockup
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  )
}

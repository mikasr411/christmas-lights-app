import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, intensity } = await request.json()

    // Apply night filter using sharp
    const processedImage = await sharp(`public${photoUrl}`)
      .modulate({
        brightness: 1 - (intensity / 100) * 0.7,
        saturation: 1 - (intensity / 100) * 0.3,
      })
      .gamma(1 + (intensity / 100) * 0.5)
      .toBuffer()

    const filename = `night-${Date.now()}.jpg`
    const path = `public/uploads/${filename}`
    await sharp(processedImage).jpeg().toFile(path)

    return NextResponse.json({ nightPhotoUrl: `/uploads/${filename}` })
  } catch (error) {
    console.error('Night filter error:', error)
    return NextResponse.json({ error: 'Night filter failed' }, { status: 500 })
  }
}



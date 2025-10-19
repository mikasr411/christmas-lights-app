import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([612, 792]) // Letter size
    const { width, height } = page.getSize()

    // Add fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Header
    page.drawText('Christmas Lights Estimate', {
      x: 50,
      y: height - 50,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    })

    // Client info
    page.drawText(`Client: ${project.client.name}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Email: ${project.client.email}`, {
      x: 50,
      y: height - 120,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })

    if (project.client.phone) {
      page.drawText(`Phone: ${project.client.phone}`, {
        x: 50,
        y: height - 140,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      })
    }

    // Estimate details
    const totals = project.totalsJson as any
    if (totals) {
      let yPos = height - 200
      
      page.drawText('Estimate Details:', {
        x: 50,
        y: yPos,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      yPos -= 30

      page.drawText(`Linear Feet: ${totals.lf?.toFixed(1) || 0} ft`, {
        x: 50,
        y: yPos,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      })

      yPos -= 20

      page.drawText(`Materials: $${totals.materials?.toFixed(2) || 0}`, {
        x: 50,
        y: yPos,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      })

      yPos -= 20

      page.drawText(`Labor: $${totals.labor?.toFixed(2) || 0}`, {
        x: 50,
        y: yPos,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      })

      yPos -= 20

      page.drawText(`Tax: $${totals.tax?.toFixed(2) || 0}`, {
        x: 50,
        y: yPos,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      })

      yPos -= 30

      page.drawText(`Total: $${totals.grandTotal?.toFixed(2) || 0}`, {
        x: 50,
        y: yPos,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0),
      })
    }

    // Footer
    page.drawText('Thank you for choosing our services!', {
      x: 50,
      y: 100,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="estimate-${projectId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

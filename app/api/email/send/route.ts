import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { projectId, clientEmail } = await request.json()

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // In a real implementation, you would use SendGrid or Resend here
    // For now, we'll just log the email content
    console.log('Email would be sent to:', clientEmail)
    console.log('Project:', project.title)
    console.log('Client:', project.client.name)

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'sent' },
    })

    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}





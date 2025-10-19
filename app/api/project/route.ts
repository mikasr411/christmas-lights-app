import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { project, client } = await request.json()

    // Create or update client
    const clientRecord = await prisma.client.upsert({
      where: { email: client.email },
      update: client,
      create: client,
    })

    // Create or update project
    const projectRecord = await prisma.project.upsert({
      where: { id: project.id || '' },
      update: {
        ...project,
        clientId: clientRecord.id,
      },
      create: {
        ...project,
        clientId: clientRecord.id,
      },
    })

    return NextResponse.json({ project: projectRecord, client: clientRecord })
  } catch (error) {
    console.error('Project save error:', error)
    return NextResponse.json({ error: 'Failed to save project' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const project = await prisma.project.findUnique({
        where: { id },
        include: { client: true },
      })
      return NextResponse.json({ project })
    }

    const projects = await prisma.project.findMany({
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Project fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}



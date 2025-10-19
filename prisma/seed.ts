import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample clients
  const client1 = await prisma.client.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Anytown, ST 12345',
    },
  })

  const client2 = await prisma.client.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '(555) 987-6543',
      address: '456 Oak Ave, Somewhere, ST 67890',
    },
  })

  // Create sample projects
  await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      clientId: client1.id,
      title: 'Holiday Lights Installation - Main House',
      photoUrl: '/uploads/sample-house.jpg',
      status: 'draft',
      measureJson: JSON.stringify({
        polylines: [
          {
            points: [
              { x: 100, y: 200 },
              { x: 300, y: 200 },
            ],
            feet: 25.5,
            type: 'eave',
          },
        ],
        scalePxPerFt: 8.0,
        confidence: 'high',
      }),
      lightsJson: JSON.stringify({
        preset: 'C9 Warm',
        bulbsPerFt: 1,
        pattern: 'solid',
        colors: ['#FFD8A8'],
        glow: 50,
      }),
      pricingJson: JSON.stringify({
        pricePerFt: {
          'C9 Warm': 4.00,
          'C9 Cool': 4.00,
          'Multicolor': 5.00,
          'Icicle': 6.00,
          'Mini String': 3.50,
          'RGB Pixel': 10.00,
        },
        addOns: [],
        fees: {
          install: 150,
          removal: 75,
          materials: 25,
          travel: 0,
          service: 0,
        },
        taxPct: 0.0875,
      }),
      totalsJson: JSON.stringify({
        lf: 25.5,
        materials: 102.00,
        labor: 225.00,
        tax: 28.61,
        grandTotal: 355.61,
      }),
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
import * as fs from 'fs'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 0. Cleanup (Optional: Keep it if you want a fresh start, otherwise comment out)
  // await prisma.incidentMessage.deleteMany()
  // await prisma.incidentAssignment.deleteMany()
  // await prisma.incidentAction.deleteMany()
  // await prisma.incident.deleteMany()
  // await prisma.trip.deleteMany()
  // await prisma.tourist.deleteMany()
  
  // Note: We don't delete Users, Roles, or Regions to avoid breaking the core setup
  // but for a full reset during dev, it's often better to keep them.

  // 1. Roles (Ensure they exist)
  const roles = ['L1', 'L2', 'L3', 'L4']
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    })
  }

  // 2. Fetch Regions
  const india = await prisma.region.findFirst({ where: { name: 'India' } })
  const maharashtra = await prisma.region.findFirst({ where: { name: 'Maharashtra' } })
  
  if (!india || !maharashtra) {
    console.error('Core regions not found. Please run initial seed first or ensure they exist.')
    return
  }

  // 3. Create persistent Demo Tourist (Updated Schema)
  await prisma.tourist.upsert({
    where: { id: 'tourist-demo-001' },
    update: {
        email: 'john@example.com',
        password: hashedPassword,
        phoneNumber: '+919988776655',
        nationality: 'Indian'
    },
    create: {
      id: 'tourist-demo-001',
      email: 'john@example.com',
      password: hashedPassword,
      fullName: 'Johnathan Tourist',
      phoneNumber: '+919988776655',
      nationality: 'Indian'
    }
  });

  // 4. Generate Mock Tourists across Indian Locations
  console.log('Generating Indian mock tourists...')
  
  const indianCities = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { name: 'Nashik', lat: 19.9975, lng: 73.7898 },
    { name: 'Aurangabad', lat: 19.8762, lng: 75.3433 },
    { name: 'Solapur', lat: 17.6599, lng: 75.9064 },
    { name: 'Amravati', lat: 20.9320, lng: 77.7523 },
    { name: 'Kolhapur', lat: 16.7050, lng: 74.2433 }
  ];

  for (const city of indianCities) {
      // Find the district region if it exists, otherwise use Maharashtra
      const district = await prisma.region.findFirst({ where: { name: city.name } });
      const regionId = district?.id || maharashtra.id;

      // Create 2 tourists per city
      for (let i = 1; i <= 2; i++) {
          const phone = `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`;
          const email = `tourist_${phone.slice(-4)}@touristsafe.in`;
          
          const tourist = await prisma.tourist.create({
              data: {
                  email,
                  password: hashedPassword,
                  phoneNumber: phone,
                  fullName: `Tourist ${city.name} ${i}`,
                  nationality: 'Indian',
                  citiesExploring: `${city.name}, Nearby Areas`,
                  tripDuration: Math.floor(Math.random() * 20) + 5
              }
          });

          // Create an active trip
          const trip = await prisma.trip.create({
              data: {
                  touristId: tourist.id,
                  isActive: true,
                  currentLat: city.lat + (Math.random() - 0.5) * 0.1,
                  currentLng: city.lng + (Math.random() - 0.5) * 0.1,
                  lastUpdate: new Date()
              }
          });

          // Create an incident for 50% of tourists
          if (Math.random() > 0.5) {
              const types = ['THEFT', 'MEDICAL', 'ACCIDENT', 'HARASSMENT', 'OTHER'];
              const severities = ['INFO', 'WARNING', 'CRITICAL'];
              
              await prisma.incident.create({
                  data: {
                      type: types[Math.floor(Math.random() * types.length)],
                      severity: severities[Math.floor(Math.random() * severities.length)],
                      status: 'OPEN',
                      description: `Reporting an issue from ${city.name}. Need assistance.`,
                      regionId: regionId,
                      touristId: tourist.id,
                      tripId: trip.id,
                      latitude: trip.currentLat,
                      longitude: trip.currentLng,
                  }
              });
          }
      }
  }

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

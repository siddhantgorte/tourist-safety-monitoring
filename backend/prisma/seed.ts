import * as fs from 'fs'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 0. Cleanup
  await prisma.incidentAssignment.deleteMany()
  await prisma.incidentAction.deleteMany()
  await prisma.incident.deleteMany()
  await prisma.trip.deleteMany()
  await prisma.tourist.deleteMany()
  await prisma.user.deleteMany()
  await prisma.region.deleteMany()

  // 1. Roles
  const roles = [
    { name: 'L1', description: 'District Officer' },
    { name: 'L2', description: 'Divisional Admin' },
    { name: 'L3', description: 'State Admin' },
    { name: 'L4', description: 'National Admin' },
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: { name: role.name },
    })
  }

  const roleL1 = await prisma.role.findUnique({ where: { name: 'L1' } })
  const roleL2 = await prisma.role.findUnique({ where: { name: 'L2' } })
  const roleL3 = await prisma.role.findUnique({ where: { name: 'L3' } })
  const roleL4 = await prisma.role.findUnique({ where: { name: 'L4' } })

  if (!roleL1 || !roleL2 || !roleL3 || !roleL4) throw new Error('Roles not created')

  // 2. Regions with Geometry
  // Country
  const india = await prisma.region.create({
    data: { 
      name: 'India', 
      type: 'COUNTRY',
      geometry: {
        type: 'Polygon',
        coordinates: [[[68.1, 8.1], [97.4, 8.1], [97.4, 37.1], [68.1, 37.1], [68.1, 8.1]]]
      }
    }
  })

  // Load GeoJSON Data
  const geoDataStr = fs.readFileSync('prisma/maharashtra_districts.json', 'utf8')
  const geoData = JSON.parse(geoDataStr)
  
  const getDistrictFeature = (name: string) => {
    const mapping: Record<string, string> = {
      'Mumbai City': 'Mumbai',
      'Raigad': 'Raigarh',
      'Sindhudurg': 'Sindhudurg',
      'Ahmednagar': 'Ahmadnagar',
      'Beed': 'Bid',
      'Buldhana': 'Buldana',
      'Gondia': 'Gondiya',
      'Gadchiroli': 'Garhchiroli',
    }
    const targetName = mapping[name] || name
    return geoData.features.find((f: any) => f.properties.district === targetName)
  }

  // State
  const maharashtra = await prisma.region.create({
    data: { 
      name: 'Maharashtra', 
      type: 'STATE', 
      parentId: india.id,
      geometry: geoData // FeatureCollection of all districts
    }
  })

  const getDistrictGeometry = (name: string) => {
    const feature = getDistrictFeature(name)
    return feature ? feature.geometry : null
  }

  // Divisions
  const divisions = [
    { name: 'Konkan', districts: ['Mumbai City', 'Mumbai Suburban', 'Thane', 'Palghar', 'Raigad', 'Ratnagiri', 'Sindhudurg'], lat: 19.0760, lng: 72.8777 },
    { name: 'Pune', districts: ['Pune', 'Satara', 'Sangli', 'Solapur', 'Kolhapur'], lat: 18.5204, lng: 73.8567 },
    { name: 'Nashik', districts: ['Nashik', 'Dhule', 'Nandurbar', 'Jalgaon', 'Ahmednagar'], lat: 19.9975, lng: 73.7898 },
    { name: 'Aurangabad', districts: ['Aurangabad', 'Jalna', 'Parbhani', 'Hingoli', 'Nanded', 'Latur', 'Osmanabad', 'Beed'], lat: 19.8762, lng: 75.3433 },
    { name: 'Amravati', districts: ['Amravati', 'Akola', 'Yavatmal', 'Washim', 'Buldhana'], lat: 20.9320, lng: 77.7523 },
    { name: 'Nagpur', districts: ['Nagpur', 'Wardha', 'Bhandara', 'Gondia', 'Chandrapur', 'Gadchiroli'], lat: 21.1458, lng: 79.0882 },
  ]

  // 3. Create Users and Districts
  // L4 User (India)
  await prisma.user.create({
    data: {
      username: 'rahul_l4',
      password: hashedPassword,
      fullName: 'Rahul (National Admin)',
      roleId: roleL4.id,
      regionId: india.id,
      isOnline: true,
      isOnDuty: true,
    }
  })

  // L3 User (Maharashtra)
  await prisma.user.create({
    data: {
      username: 'savita_l3',
      password: hashedPassword,
      fullName: 'Savita (State Admin)',
      roleId: roleL3.id,
      regionId: maharashtra.id,
      isOnline: true,
      isOnDuty: true,
    }
  })

  for (const div of divisions) {
    const divisionFeatures = div.districts.map(name => {
      let feature = getDistrictFeature(name)
      if (!feature && name === 'Palghar') {
        feature = JSON.parse(JSON.stringify(getDistrictFeature('Thane'))) // Clone Thane
        if (feature) feature.properties.district = 'Palghar'
      }
      return feature
    }).filter(Boolean)

    const division = await prisma.region.create({
      data: { 
        name: div.name, 
        type: 'DIVISION', 
        parentId: maharashtra.id,
        geometry: {
          type: 'FeatureCollection',
          features: divisionFeatures
        }
      }
    })

    // L2 User for each Division
    const l2Username = `${div.name.toLowerCase().replace(/\s/g, '_')}_l2`
    await prisma.user.create({
      data: {
        username: l2Username,
        password: hashedPassword,
        fullName: `${div.name} Div Admin`,
        roleId: roleL2.id,
        regionId: division.id,
        isOnline: true,
        isOnDuty: true,
      }
    })

    for (const distName of div.districts) {
      let geometry = getDistrictGeometry(distName)
      
      // Fallback for Palghar (missing in GeoJSON) - use Thane's geometry if available
      if (!geometry && distName === 'Palghar') {
        geometry = getDistrictGeometry('Thane')
      }

      // Final fallback if still null (should not happen for others)
      if (!geometry) {
        geometry = {
          type: 'Polygon',
          coordinates: [[[div.lng - 0.1, div.lat - 0.1], [div.lng + 0.1, div.lat - 0.1], [div.lng + 0.1, div.lat + 0.1], [div.lng - 0.1, div.lat + 0.1], [div.lng - 0.1, div.lat - 0.1]]]
        }
      }

      const district = await prisma.region.create({
        data: { 
          name: distName, 
          type: 'DISTRICT', 
          parentId: division.id,
          geometry
        }
      })

      // L1 User for some districts (e.g., first district in each division)
      if (distName === div.districts[0]) {
        const l1Username = `${distName.toLowerCase().replace(/\s/g, '_')}_l1`
        await prisma.user.create({
          data: {
            username: l1Username,
            password: hashedPassword,
            fullName: `${distName} District Officer`,
            roleId: roleL1.id,
            regionId: district.id,
            isOnline: true,
            isOnDuty: true,
          }
        })
      }
      
      // Add dummy live tourists and incidents for demonstration
      await createLiveData(district.id, div.lat, div.lng)
    }
  }

  console.log('Seeding completed successfully!')
}

async function createLiveData(districtId: string, baseLat: number, baseLng: number) {
  // Create a tourist
  const phone = `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`
  const tourist = await prisma.tourist.create({
    data: {
      phoneNumber: phone,
      fullName: `Tourist ${phone.slice(-4)}`,
      nationality: 'Indian'
    }
  })

  // Create an active trip with live location
  const trip = await prisma.trip.create({
    data: {
      touristId: tourist.id,
      isActive: true,
      currentLat: baseLat + (Math.random() - 0.5) * 0.05,
      currentLng: baseLng + (Math.random() - 0.5) * 0.05,
      lastUpdate: new Date()
    }
  })

  // Create an incident
  await prisma.incident.create({
    data: {
      type: 'LOST_ACCESSORY',
      severity: 'INFO',
      status: 'OPEN',
      description: 'Lost an item near the central hub.',
      regionId: districtId,
      touristId: tourist.id,
      tripId: trip.id,
      latitude: trip.currentLat,
      longitude: trip.currentLng,
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

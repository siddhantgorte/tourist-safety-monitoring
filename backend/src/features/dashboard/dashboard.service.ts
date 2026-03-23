import { prisma } from '../../shared/db/client';
import { getDescendantRegionIds } from '../../shared/utils/region';

export class DashboardService {

  // Section 2A: High-Level Metrics
  async getOverviewStats(userId: string) {
    let user;
    try {
      user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: { region: true }
      });
    } catch (error) {
      // Fallback to L4 if user not found, for easier testing
      user = await prisma.user.findFirstOrThrow({
        where: { role: { name: 'L4' } },
        include: { region: true }
      });
    }

    if (!user.regionId) {
      throw new Error("User region not found");
    }

    const regionIds = await getDescendantRegionIds(user.regionId);

    const [incidentCount, officerCount, touristStats, liveTrips] = await Promise.all([
      prisma.incident.count({ where: { regionId: { in: regionIds } } }),
      prisma.user.count({ where: { regionId: { in: regionIds }, isOnline: true } }),
      prisma.tourist.count({
        where: {
          trips: {
            some: {
              isActive: true,
              incidents: { some: { regionId: { in: regionIds } } }
            }
          }
        }
      }),
      prisma.trip.findMany({
        where: {
          isActive: true,
          tourist: {
            incidents: { some: { regionId: { in: regionIds } } }
          }
        },
        include: { tourist: true }
      })
    ]);

    return {
      regionName: user.region?.name || 'Global',
      regionId: user.region?.id,
      regionGeometry: user.region?.geometry,
      activeIncidents: { count: incidentCount, delta: 0, trend: 'neutral' },
      officersOnline: { count: officerCount, delta: 0, details: { onDuty: officerCount, offDuty: 0 } },
      touristsMonitored: { count: touristStats, delta: 0 },
      responseRate: { value: 100, label: 'Optimal' },
      liveTourists: liveTrips.map((trip: any) => ({
        id: trip.tourist.id,
        name: trip.tourist.fullName,
        lat: trip.currentLat,
        lng: trip.currentLng,
        lastUpdate: trip.lastUpdate
      }))
    };
  }

  // Section 2B: Recent Incidents Feed
  async getRecentIncidents(userId: string, limit: number = 5) {
    let user;
    try {
      user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: { region: true }
      });
    } catch (error) {
      // Fallback to L4 if user not found, for easier testing
      user = await prisma.user.findFirstOrThrow({
        where: { role: { name: 'L4' } },
        include: { region: true }
      });
    }

    if (!user.regionId) return [];

    const regionIds = await getDescendantRegionIds(user.regionId);

    const incidents = await prisma.incident.findMany({
      where: { regionId: { in: regionIds } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { region: true, tourist: true }
    });

    return incidents.map((inc: any) => ({
      id: inc.id,
      type: inc.type,
      severity: inc.severity,
      status: inc.status,
      locationMsg: inc.region?.name || 'Unknown',
      coordinates: { lat: inc.latitude || 0, lng: inc.longitude || 0 },
      timeSinceReported: 'Now',
      assignedOfficers: 0
    }));
  }

  // Section 2C: Zone Status
  async getZoneStatus(userId: string) {
    let user;
    try {
      user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: { region: true }
      });
    } catch (error) {
      user = await prisma.user.findFirstOrThrow({
        where: { role: { name: 'L4' } },
        include: { region: true }
      });
    }

    if (!user.regionId) return [];

    const children = await prisma.region.findMany({
      where: { parentId: user.regionId },
      include: { 
        incidents: { 
          where: { status: 'OPEN' },
          select: { severity: true }
        } 
      }
    });

    const summary = {
      allClear: 0,
      underWatch: 0,
      activeAlert: 0,
      critical: 0
    };

    children.forEach((child: any) => {
      const openIncidents = child.incidents;
      if (openIncidents.length === 0) {
        summary.allClear++;
      } else {
        const hasCritical = openIncidents.some((inc: any) => inc.severity === 'CRITICAL');
        const hasWarning = openIncidents.some((inc: any) => inc.severity === 'WARNING' || inc.severity === 'ALERT');
        
        if (hasCritical) summary.critical++;
        else if (hasWarning) summary.activeAlert++;
        else summary.underWatch++;
      }
    });

    return [
      { label: "All Clear", value: summary.allClear, status: 'stable' },
      { label: "Under Watch", value: summary.underWatch, status: 'warning' },
      { label: "Active Alert", value: summary.activeAlert, status: 'danger' },
      { label: "Critical", value: summary.critical, status: 'critical' },
    ];
  }
}

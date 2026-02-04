import { prisma } from '../../shared/db/client';

export class DashboardService {

    // Section 2A: High-Level Metrics
    async getOverviewStats(userRole: string) {
        // TODO: Replace with real DB aggregation when connection exists

        return {
            activeIncidents: {
                count: 12,
                delta: 2,
                trend: 'up'
            },
            officersOnline: {
                count: 47,
                delta: 3,
                details: { onDuty: 35, offDuty: 12 }
            },
            touristsMonitored: {
                count: 2341,
                delta: 156
            },
            responseRate: {
                value: 94.2,
                label: 'Excellent'
            }
        };
    }

    // Section 2B: Recent Incidents Feed
    async getRecentIncidents(limit: number = 5) {
        // Return mock data matching Prisma model shape roughly
        return [
            {
                id: 'inc-001',
                type: 'PICKPOCKETING',
                severity: 'WARNING',
                status: 'RESPONDING',
                locationMsg: 'Central Market, Zone A',
                coordinates: { lat: 15.4989, lng: 73.8278 },
                timeSinceReported: '12m',
                assignedOfficers: 2
            },
            {
                id: 'inc-002',
                type: 'LOST_TOURIST',
                severity: 'INFO',
                status: 'OPEN',
                locationMsg: 'North Beach Entrance',
                coordinates: { lat: 15.5123, lng: 73.7900 },
                timeSinceReported: '45m',
                assignedOfficers: 0
            }
        ];
    }

    // Section 2C: Zone Status
    async getZoneStatus() {
        return [
            { id: 'zone-1', name: 'North District', status: 'Active Alert', incidentCount: 5 },
            { id: 'zone-2', name: 'Market Area', status: 'Under Watch', incidentCount: 2 },
            { id: 'zone-3', name: 'South Beach', status: 'All Clear', incidentCount: 0 }
        ];
    }
}

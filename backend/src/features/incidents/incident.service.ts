import { prisma } from '../../shared/db/client';
import { SocketService } from '../../shared/utils/socket.service';

export class IncidentService {
    private socketService = SocketService.getInstance();

    async getAllIncidents() {
        // Should fetch from DB
        return [
            {
                id: 'inc-001',
                type: 'PICKPOCKETING',
                severity: 'WARNING',
                status: 'RESPONDING',
                description: 'Wallet stolen near North Gate',
                zoneId: 'zone-1',
                createdAt: new Date(),
                updatedAt: new Date(),
                source: 'MANUAL',
                assignedOfficersCount: 2
            }
        ];
    }

    async getIncidentById(id: string) {
        // Data Contract Section 4: Incident Detail (on click)
        return {
            id,
            type: 'PICKPOCKETING',
            severity: 'WARNING',
            status: 'RESPONDING',
            description: 'Wallet stolen near North Gate',
            zoneId: 'zone-1',
            touristId: 'tourst-id-9988',
            assignedOfficersCount: 2,
            createdAt: new Date(Date.now() - 3600000), // 1 hour ago
            updatedAt: new Date(),
            timeline: [
                { time: new Date(Date.now() - 3600000), event: 'Incident Reported', icon: 'AlertCircle' },
                { time: new Date(Date.now() - 3000000), event: 'Officer Assigned', icon: 'User' },
                { time: new Date(Date.now() - 2400000), event: 'Responding to Location', icon: 'MapPin' }
            ],
            evidence: [
                { id: 'ev-1', type: 'IMAGE', url: '/placeholder.jpg', title: 'CCTV Footage Screenshot' }
            ],
            actions: [
                { id: 'act-1', note: 'Officer J. Doe is on scene.', timestamp: new Date() }
            ]
        };
    }

    async updateIncidentStatus(id: string, status: string) {
        // In a real app, update DB and emit socket event
        const incident = await this.getIncidentById(id);
        const oldStatus = incident.status;

        const updated = { id, status, updatedAt: new Date() };

        // Data Contract Section 8: Push updates for status change
        this.socketService.notifyIncidentStatusChange(id, status, oldStatus);

        return updated;
    }

    async createIncident(data: any) {
        // Mock DB creation
        const newIncident = {
            id: `inc-${Date.now()}`,
            ...data,
            status: 'OPEN',
            createdAt: new Date()
        };

        // Real-time notification (Data Contract Section 8)
        this.socketService.notifyNewIncident(newIncident);

        return newIncident;
    }
    async updateIncident(id: string, updates: any) {
        // In a real app, update DB
        const incident = await this.getIncidentById(id);
        const updated = { ...incident, ...updates, updatedAt: new Date() };

        // Log action in timeline
        if (!updated.timeline) updated.timeline = [];
        updated.timeline.push({
            time: new Date(),
            event: `Incident details updated: ${Object.keys(updates).join(', ')}`,
            icon: 'Edit2'
        });

        return updated;
    }

    async assignOfficers(id: string, officerIds: string[]) {
        const incident = await this.getIncidentById(id);
        incident.assignedOfficersCount = officerIds.length;

        if (!incident.timeline) incident.timeline = [];
        incident.timeline.push({
            time: new Date(),
            event: `${officerIds.length} officers assigned to incident`,
            icon: 'Users'
        });

        // Notify officers via socket (Mock)
        officerIds.forEach(offId => {
            this.socketService.broadcastToRole('L2', 'incident:assignment', { incidentId: id, officerId: offId });
        });

        return incident;
    }
}

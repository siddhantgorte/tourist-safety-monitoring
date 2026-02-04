import { SocketService } from '../../shared/utils/socket.service';

export interface Geofence {
    id: string;
    name: string;
    type: 'RESTRICTED' | 'DANGER' | 'SAFE' | 'MONITORED';
    coordinates: { lat: number; lng: number }[]; // Polygon points
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    active: boolean;
}

export class GeofenceService {
    private socketService = SocketService.getInstance();

    private mockGeofences: Geofence[] = [
        {
            id: 'gf-1',
            name: 'North Forest Reserve',
            type: 'RESTRICTED',
            coordinates: [{ lat: 15.55, lng: 73.85 }, { lat: 15.56, lng: 73.86 }, { lat: 15.54, lng: 73.87 }],
            riskLevel: 'HIGH',
            active: true
        },
        {
            id: 'gf-2',
            name: 'Central Market',
            type: 'MONITORED',
            coordinates: [{ lat: 15.50, lng: 73.80 }, { lat: 15.51, lng: 73.81 }, { lat: 15.49, lng: 73.82 }],
            riskLevel: 'LOW',
            active: true
        }
    ];

    async getAllGeofences() {
        return this.mockGeofences;
    }

    async createGeofence(data: Omit<Geofence, 'id'>) {
        const newGf: Geofence = {
            id: `gf-${Date.now()}`,
            ...data
        };
        this.mockGeofences.push(newGf);
        return newGf;
    }

    async updateGeofence(id: string, updates: Partial<Geofence>) {
        const index = this.mockGeofences.findIndex(gf => gf.id === id);
        if (index === -1) throw new Error('Geofence not found');
        this.mockGeofences[index] = { ...this.mockGeofences[index], ...updates };
        return this.mockGeofences[index];
    }

    async deleteGeofence(id: string) {
        const index = this.mockGeofences.findIndex(gf => gf.id === id);
        if (index === -1) throw new Error('Geofence not found');
        this.mockGeofences.splice(index, 1);
        return { success: true };
    }

    // Process a tourist location update to check for geo-fence breaches
    async checkLocation(touristId: string, location: { lat: number; lng: number }) {
        // Mock entry detection: If lat > 15.54, trigger entry into North Forest
        if (location.lat > 15.54) {
            this.socketService.broadcastToRole('L2', 'alert:geofence_breach', {
                touristId,
                geofenceId: 'gf-1',
                geofenceName: 'North Forest Reserve',
                location,
                timestamp: new Date()
            });
            return { breached: true, geofenceId: 'gf-1' };
        }
        return { breached: false };
    }
}

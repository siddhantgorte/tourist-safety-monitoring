import { prisma } from '../../shared/db/client';
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

    private async ensureDefaultZone() {
        let zone = await prisma.zone.findFirst({
            where: { name: 'Main Safety Zone' }
        });

        if (!zone) {
            zone = await prisma.zone.create({
                data: {
                    name: 'Main Safety Zone',
                    riskLevel: 'LOW',
                    description: 'Default collective zone for geofences'
                }
            });
        }
        return zone.id;
    }

    async getAllGeofences(): Promise<Geofence[]> {
        const fences = await prisma.geoFence.findMany();
        return fences.map(gf => ({
            id: gf.id,
            name: gf.name,
            type: gf.type as any,
            coordinates: gf.coordinates as any,
            riskLevel: 'LOW', // Default or fetch from Zone if needed, but schema shows it on Zone
            active: true // Schema doesn't have 'active' field on GeoFence, maybe add it?
        }));
    }

    async getActiveGeofences(): Promise<Geofence[]> {
        // For now, return all since we don't have an active flag in Prisma yet
        // In a real app, we'd filter by active: true
        return this.getAllGeofences();
    }

    async createGeofence(data: Omit<Geofence, 'id'>) {
        const zoneId = await this.ensureDefaultZone();
        
        const newGf = await prisma.geoFence.create({
            data: {
                name: data.name,
                type: data.type,
                coordinates: data.coordinates as any,
                zoneId: zoneId
            }
        });

        return {
            id: newGf.id,
            name: newGf.name,
            type: newGf.type as any,
            coordinates: newGf.coordinates as any,
            riskLevel: data.riskLevel,
            active: true
        };
    }

    async updateGeofence(id: string, updates: Partial<Geofence>) {
        const updated = await prisma.geoFence.update({
            where: { id },
            data: {
                name: updates.name,
                type: updates.type,
                coordinates: updates.coordinates as any
            }
        });

        return {
            id: updated.id,
            name: updated.name,
            type: updated.type as any,
            coordinates: updated.coordinates as any,
            riskLevel: updates.riskLevel || 'LOW',
            active: true
        };
    }

    async deleteGeofence(id: string) {
        await prisma.geoFence.delete({
            where: { id }
        });
        return { success: true };
    }

    // Process a tourist location update to check for geo-fence breaches
    // Note: Re-implemented in SocketService for now by the user, 
    // but keeping this for potential logic centralized cleanup
    async checkLocation(touristId: string, location: { lat: number; lng: number }) {
        const fences = await this.getActiveGeofences();
        // Point-in-polygon check would go here if not handled in SocketService
        return { breached: false };
    }
}

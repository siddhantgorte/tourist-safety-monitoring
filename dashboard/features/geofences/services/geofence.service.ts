import api from "@/lib/api";

export interface Geofence {
    id: string;
    name: string;
    type: 'RESTRICTED' | 'DANGER' | 'SAFE' | 'MONITORED';
    coordinates: { lat: number; lng: number }[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    active: boolean;
}

export const geofenceService = {
    getGeofences: async (): Promise<Geofence[]> => {
        const res = await api.get('/geofences');
        return res.data.data;
    },
    createGeofence: async (data: Omit<Geofence, 'id'>): Promise<Geofence> => {
        const res = await api.post('/geofences', data);
        return res.data.data;
    },
    updateGeofence: async (id: string, updates: Partial<Geofence>): Promise<Geofence> => {
        const res = await api.patch(`/geofences/${id}`, updates);
        return res.data.data;
    },
    deleteGeofence: async (id: string): Promise<void> => {
        await api.delete(`/geofences/${id}`);
    }
};

import { Server, Socket } from 'socket.io';

export class SocketService {
    private static instance: SocketService;
    private io: Server | null = null;
    private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

    private constructor() { }

    static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    initialize(io: Server) {
        this.io = io;
        this.io.on('connection', (this.handleConnection.bind(this)));
    }

    private handleConnection(socket: Socket) {
        console.log(`Socket connected: ${socket.id}`);

        // Auth handshake (basic implementation)
        const userId = socket.handshake.auth.userId;
        if (userId) {
            this.connectedUsers.set(socket.id, userId);
            socket.join(`user:${userId}`);
            console.log(`User ${userId} authenticated on socket ${socket.id}`);
        }

        // Role-based rooms
        const role = socket.handshake.auth.role;
        if (role) {
            socket.join(`role:${role}`);
        }

        socket.on('disconnect', () => {
            this.connectedUsers.delete(socket.id);
            console.log(`Socket disconnected: ${socket.id}`);
        });

        // Handle incoming tracking updates from Tourist App
        socket.on('tourist:location_update', (data) => {
            // In a real app, send to GeoService
            // For now, broadcast to authorities
            this.broadcastToRole('L2', 'live:tourist_update', data);
        });

        // Handle Panic
        socket.on('tourist:panic', (data) => {
            this.broadcastToRole('L2', 'alert:panic', data);
            this.broadcastToRole('L3', 'alert:panic', data);
        });
    }

    // --- Emitters matching Data Contract Section 8 ---

    notifyNewIncident(incident: any) {
        if (!this.io) return;
        this.io.emit('incident:new', {
            type: 'incident:new',
            entityId: incident.id,
            timestamp: new Date(),
            payload: {
                type: incident.type,
                priority: incident.severity,
                location: { lat: incident.latitude, lng: incident.longitude }
            }
        });
    }

    notifyIncidentStatusChange(incidentId: string, status: string, oldStatus: string) {
        if (!this.io) return;
        this.io.emit('incident:update', {
            type: 'incident:status_change',
            entityId: incidentId,
            timestamp: new Date(),
            payload: { status, oldStatus }
        });
    }

    broadcastToRole(role: string, event: string, data: any) {
        if (!this.io) return;
        this.io.to(`role:${role}`).emit(event, data);
    }
}

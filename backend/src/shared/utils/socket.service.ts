import { Server, Socket } from 'socket.io';
import { prisma } from '../db/client';


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

        const role = socket.handshake.auth.role;
        if (role) {
            socket.join(`role:${role}`);
        }

        const regionId = socket.handshake.auth.regionId;
        if (regionId) {
            socket.join(`region:${regionId}`);
            console.log(`User joint region room: region:${regionId}`);
        }

        socket.on('disconnect', () => {
            this.connectedUsers.delete(socket.id);
            console.log(`Socket disconnected: ${socket.id}`);
        });

        // Handle incoming tracking updates from Tourist App
        socket.on('tourist:location_update', (data) => {
            console.log(`📡 Telemetry from ${data.id}: Lat ${data.lat}, Lng ${data.lng}`);
            // Broadcast to specific roles and also a generic live event
            this.broadcastToRole('L2', 'live:tourist_update', data);
            this.broadcastToRole('L3', 'live:tourist_update', data);
            this.broadcastToRole('L4', 'live:tourist_update', data);
            
            // Generic broadcast for dashboard map
            this.io?.emit('live:tourist_update', data);
        });

        // Handle Panic
        socket.on('tourist:panic', (data) => {
            this.broadcastToRole('L2', 'alert:panic', data);
            this.broadcastToRole('L3', 'alert:panic', data);
        });

        // --- Chat Features ---
        // Join Chat Room
        socket.on('chat:join', (incidentId: string) => {
            socket.join(`incident:${incidentId}`);
            console.log(`Socket ${socket.id} joined chat room incident:${incidentId}`);
        });

        // Send Chat Message
        socket.on('chat:send', async (data: { incidentId: string, content: string, senderRole: string, senderId?: string }) => {
            try {
                // Save to database
                const message = await prisma.incidentMessage.create({
                    data: {
                        incidentId: data.incidentId,
                        content: data.content,
                        senderRole: data.senderRole,
                        senderId: data.senderId
                    }
                });

                // Broadcast to everyone in the incident room
                this.io?.to(`incident:${data.incidentId}`).emit('chat:receive', message);
            } catch (error) {
                console.error('Failed to save or broadcast chat message:', error);
            }
        });
    }

    // --- Emitters matching Data Contract Section 8 ---

    notifyNewIncident(incident: any, targetedRegionIds?: string[]) {
        if (!this.io) return;
        
        const payload = {
            type: 'incident:new',
            entityId: incident.id,
            timestamp: new Date(),
            payload: {
                type: incident.type,
                priority: incident.severity,
                location: { lat: incident.latitude, lng: incident.longitude }
            }
        };

        if (targetedRegionIds && targetedRegionIds.length > 0) {
            // Broadcast to all relevant regions in the hierarchy
            for (const rid of targetedRegionIds) {
                this.io.to(`region:${rid}`).emit('incident:new', payload);
            }
        } else {
            // Fallback: Global broadcast
            this.io.emit('incident:new', payload);
        }
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

    broadcastToRegion(regionId: string, event: string, data: any) {
        if (!this.io) return;
        this.io.to(`region:${regionId}`).emit(event, data);
    }
}

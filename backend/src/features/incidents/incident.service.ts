import { prisma } from '../../shared/db/client';
import { SocketService } from '../../shared/utils/socket.service';
import { getDescendantRegionIds, getAncestorRegionIds } from '../../shared/utils/region';

export class IncidentService {
    private socketService = SocketService.getInstance();

    async getAllIncidents(userId: string) {
        let user;
        try {
            user = await prisma.user.findUniqueOrThrow({
                where: { id: userId },
                include: { region: true }
            });
        } catch (error) {
            // Fallback for easier testing if userId is invalid
            user = await prisma.user.findFirstOrThrow({
                where: { role: { name: 'L4' } },
                include: { region: true }
            });
        }

        if (!user.regionId) return [];

        const regionIds = await getDescendantRegionIds(user.regionId);

        return await prisma.incident.findMany({
            where: { regionId: { in: regionIds } },
            orderBy: { createdAt: 'desc' },
            include: { 
                region: true, 
                tourist: true,
                assignments: { include: { user: true } },
                _count: { select: { assignments: true } }
            }
        });
    }

    async getIncidentById(id: string) {
        return await prisma.incident.findUnique({
            where: { id },
            include: {
                region: true,
                tourist: true,
                trip: true,
                evidence: true,
                actions: {
                    include: { user: true },
                    orderBy: { timestamp: 'desc' }
                },
                assignments: {
                    include: { user: true }
                }
            }
        });
    }

    async updateIncidentStatus(id: string, status: string) {
        const oldIncident = await prisma.incident.findUnique({ where: { id } });
        if (!oldIncident) throw new Error("Incident not found");

        const updated = await prisma.incident.update({
            where: { id },
            data: { 
                status,
                actions: {
                    create: {
                        actionType: 'STATUS_CHANGE',
                        details: `Status changed from ${oldIncident.status} to ${status}`
                    }
                }
            }
        });

        this.socketService.notifyIncidentStatusChange(id, status, oldIncident.status);
        return updated;
    }

    async createIncident(data: any) {
        let regionId = data.regionId;
        
        // If no regionId provided (e.g. from mobile), try to find a default district
        if (!regionId) {
            const defaultRegion = await prisma.region.findFirst({
                where: { type: 'DISTRICT' }
            });
            regionId = defaultRegion?.id;
        }

        const inputData = { ...data };

        // Safeguard for mock touristId from mobile app
        if (inputData.touristId) {
            const touristExists = await prisma.tourist.findUnique({ where: { id: inputData.touristId }});
            if (!touristExists) {
                if (inputData.touristId === 'tourist-demo-001') {
                    // Auto-create demo tourist if missing
                    await prisma.tourist.create({
                        data: {
                            id: 'tourist-demo-001',
                            fullName: 'Johnathan Tourist',
                            email: 'john@example.com',
                            password: '$2b$10$7R6v7E1WvYF9.XqH7t2u3e6V7R6v7E1WvYF9.XqH7t2u3e6V7R6v7', // dummy hash
                            phoneNumber: '+919988776655',
                            nationality: 'Indian'
                        }
                    });
                } else {
                    const anyTourist = await prisma.tourist.findFirst();
                    if (anyTourist) {
                        inputData.touristId = anyTourist.id;
                    } else {
                        delete inputData.touristId;
                    }
                }
            }
        }

        const newIncident = await prisma.incident.create({
            data: {
                ...inputData,
                regionId,
                status: 'OPEN'
            }
        });

        let ancestors: string[] = [];
        if (newIncident.regionId) {
            ancestors = await getAncestorRegionIds(newIncident.regionId);
        }
        this.socketService.notifyNewIncident(newIncident, ancestors);
        return newIncident;
    }

    async updateIncident(id: string, updates: any) {
        return await prisma.incident.update({
            where: { id },
            data: {
                ...updates,
                actions: {
                    create: {
                        actionType: 'DETAILS_UPDATE',
                        details: `Incident details updated: ${Object.keys(updates).join(', ')}`
                    }
                }
            }
        });
    }

    async assignOfficers(id: string, officerIds: string[]) {
        // Remove existing assignments and add new ones
        await prisma.incidentAssignment.deleteMany({ where: { incidentId: id } });
        
        const assignments = await Promise.all(
            officerIds.map(userId => 
                prisma.incidentAssignment.create({
                    data: { incidentId: id, userId }
                })
            )
        );

        await prisma.incidentAction.create({
            data: {
                incidentId: id,
                actionType: 'ASSIGNMENT',
                details: `${officerIds.length} officers assigned`
            }
        });

        // Notify officers via socket (Broadcast to role for now or specific users if implemented)
        this.socketService.broadcastToRole('L2', 'incident:assignment', { incidentId: id, officerIds });

        return await this.getIncidentById(id);
    }

    async getIncidentMessages(incidentId: string) {
        return await prisma.incidentMessage.findMany({
            where: { incidentId },
            orderBy: { timestamp: 'asc' }
        });
    }

    async getIncidentsByTourist(touristId: string) {
        return await prisma.incident.findMany({
            where: { touristId },
            orderBy: { createdAt: 'desc' },
            include: {
                messages: {
                    orderBy: { timestamp: 'desc' },
                    take: 1
                }
            }
        });
    }
}

import { prisma } from '../../shared/db/client';
import { getDescendantRegionIds } from '../../shared/utils/region';

export interface User {
    id: string;
    username: string;
    fullName: string | null;
    roleId: string;
    regionId: string | null;
    roleName: string;
    regionName: string | null;
    isOnline: boolean;
    isOnDuty: boolean;
}

const ROLE_LEVELS: Record<string, number> = {
    'L1': 1,
    'L2': 2,
    'L3': 3,
    'L4': 4
};

export class UserService {
    private async checkAuthorization(requesterId: string, targetRegionId: string | null, targetRoleName: string) {
        const requester = await prisma.user.findUnique({
            where: { id: requesterId },
            include: { role: true }
        });

        if (!requester) throw new Error('Requester not found');
        
        // National admin can do everything
        if (requester.role.name === 'L4') return true;

        const requesterLevel = ROLE_LEVELS[requester.role.name] || 0;
        const targetLevel = ROLE_LEVELS[targetRoleName] || 0;

        // Rule 1: Cannot manage horizontal or higher level roles
        if (targetLevel >= requesterLevel) return false;

        // Rule 2: Target region must be a descendant of requester's region
        if (!requester.regionId) return false;
        if (!targetRegionId) return false;

        const descendantIds = await getDescendantRegionIds(requester.regionId);
        return descendantIds.includes(targetRegionId);
    }

    async getAllUsers(requesterId: string) {
        const requester = await prisma.user.findUnique({
            where: { id: requesterId },
            include: { role: true }
        });

        if (!requester) return [];

        let whereClause = {};
        if (requester.role.name !== 'L4' && requester.regionId) {
            const descendantIds = await getDescendantRegionIds(requester.regionId);
            whereClause = { regionId: { in: descendantIds } };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            include: { role: true, region: true }
        });

        return users.map((u: any) => ({
            id: u.id,
            username: u.username,
            fullName: u.fullName,
            roleId: u.roleId,
            regionId: u.regionId,
            roleName: u.role.name,
            regionName: u.region?.name || null,
            isOnline: u.isOnline,
            isOnDuty: u.isOnDuty
        }));
    }

    async getUserSummary() {
        const [total, online, onDuty] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { isOnline: true } }),
            prisma.user.count({ where: { isOnDuty: true } })
        ]);

        return { total, online, onDuty };
    }

    async createUser(requesterId: string, userData: any) {
        const role = await prisma.role.findUnique({ where: { id: userData.roleId } });
        if (!role) throw new Error('Role not found');

        const isAuthorized = await this.checkAuthorization(requesterId, userData.regionId, role.name);
        if (!isAuthorized) throw new Error('Unauthorized hierarchical management');

        return prisma.user.create({
            data: {
                username: userData.username,
                password: 'hashed_dummy_password', // In a real app, hash this
                fullName: userData.fullName,
                roleId: userData.roleId,
                regionId: userData.regionId,
                isOnline: false,
                isOnDuty: false
            }
        });
    }

    async updateUser(requesterId: string, id: string, updates: any) {
        const target = await prisma.user.findUnique({
            where: { id },
            include: { role: true }
        });
        if (!target) throw new Error('Target user not found');

        const isAuthorized = await this.checkAuthorization(requesterId, target.regionId, target.role.name);
        if (!isAuthorized) throw new Error('Unauthorized hierarchical management');

        return prisma.user.update({
            where: { id },
            data: updates
        });
    }

    async deleteUser(requesterId: string, id: string) {
        const target = await prisma.user.findUnique({
            where: { id },
            include: { role: true }
        });
        if (!target) throw new Error('Target user not found');

        const isAuthorized = await this.checkAuthorization(requesterId, target.regionId, target.role.name);
        if (!isAuthorized) throw new Error('Unauthorized hierarchical management');

        await prisma.user.delete({ where: { id } });
        return { success: true };
    }
}

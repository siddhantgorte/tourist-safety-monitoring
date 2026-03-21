import { prisma } from '../../shared/db/client';

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

export class UserService {
    async getAllUsers() {
        const users = await prisma.user.findMany({
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

    async createUser(userData: any) {
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

    async updateUser(id: string, updates: any) {
        return prisma.user.update({
            where: { id },
            data: updates
        });
    }

    async deleteUser(id: string) {
        await prisma.user.delete({ where: { id } });
        return { success: true };
    }
}

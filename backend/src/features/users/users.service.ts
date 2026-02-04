import { SocketService } from '../../shared/utils/socket.service';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    zone: string;
    status: 'Online' | 'Offline';
    duty: 'On Duty' | 'Off Duty';
}

export class UserService {
    private socketService = SocketService.getInstance();

    private mockUsers: User[] = [
        { id: 'usr-1', name: 'John Doe', email: 'john@police.gov', phone: '+1234567890', role: 'L2', zone: 'North District', status: 'Online', duty: 'On Duty' },
        { id: 'usr-2', name: 'Jane Smith', email: 'jane@police.gov', phone: '+1234567891', role: 'L3', zone: 'Multi-District', status: 'Online', duty: 'On Duty' },
        { id: 'usr-3', name: 'Robert Brown', email: 'robert@police.gov', phone: '+1234567892', role: 'L1', zone: 'Market Area', status: 'Offline', duty: 'Off Duty' }
    ];

    async getAllUsers() {
        return this.mockUsers;
    }

    async getUserSummary() {
        return {
            total: this.mockUsers.length,
            online: this.mockUsers.filter(u => u.status === 'Online').length,
            onDuty: this.mockUsers.filter(u => u.duty === 'On Duty').length
        };
    }

    async createUser(userData: Omit<User, 'id' | 'status' | 'duty'>) {
        const newUser: User = {
            id: `usr-${Date.now()}`,
            ...userData,
            status: 'Offline',
            duty: 'Off Duty'
        };
        this.mockUsers.push(newUser);
        return newUser;
    }

    async updateUser(id: string, updates: Partial<User>) {
        const index = this.mockUsers.findIndex(u => u.id === id);
        if (index === -1) throw new Error('User not found');

        this.mockUsers[index] = { ...this.mockUsers[index], ...updates };
        return this.mockUsers[index];
    }

    async deleteUser(id: string) {
        const index = this.mockUsers.findIndex(u => u.id === id);
        if (index === -1) throw new Error('User not found');
        this.mockUsers.splice(index, 1);
        return { success: true };
    }
}

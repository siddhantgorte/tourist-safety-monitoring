import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export interface Tourist {
    id: string;
    email: string;
    fullName: string | null;
    phoneNumber: string;
    nationality: string | null;
    citiesExploring: string | null;
    tripDuration: number | null;
    createdAt: string;
}

export const usersService = {
    getUsers: async () => {
        const res = await api.get('/users');
        return res.data.data;
    },
    createUser: async (user: Omit<User, 'id' | 'status' | 'duty'>) => {
        const res = await api.post('/users', user);
        return res.data.data;
    },
    updateUser: async ({ id, ...updates }: Partial<User> & { id: string }) => {
        const res = await api.patch(`/users/${id}`, updates);
        return res.data.data;
    },
    deleteUser: async (id: string) => {
        const res = await api.delete(`/users/${id}`);
        return res.data;
    },
    getTourists: async () => {
        const res = await api.get('/tourists/all'); // I should create this endpoint in the backend
        return res.data.data;
    }
};

export const useUsers = () => {
    return useQuery({
        queryKey: ['users-list'],
        queryFn: usersService.getUsers,
    });
};

export const useTourists = () => {
    return useQuery({
        queryKey: ['tourists-list'],
        queryFn: usersService.getTourists,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: usersService.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: usersService.updateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: usersService.deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
        },
    });
};

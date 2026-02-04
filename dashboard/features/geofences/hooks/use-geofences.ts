import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { geofenceService, Geofence } from "../services/geofence.service";

export const useGeofences = () => {
    return useQuery({
        queryKey: ['geofences-list'],
        queryFn: geofenceService.getGeofences,
    });
};

export const useCreateGeofence = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: geofenceService.createGeofence,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['geofences-list'] });
        },
    });
};

export const useUpdateGeofence = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updates }: { id: string } & Partial<Geofence>) =>
            geofenceService.updateGeofence(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['geofences-list'] });
        },
    });
};

export const useDeleteGeofence = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: geofenceService.deleteGeofence,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['geofences-list'] });
        },
    });
};

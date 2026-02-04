import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const overviewService = {
    getStats: async () => {
        const res = await api.get('/dashboard/overview');
        return res.data.data;
    },
    getRecentIncidents: async () => {
        const res = await api.get('/dashboard/incidents');
        return res.data.data;
    },
    getZoneStatus: async () => {
        const res = await api.get('/dashboard/zones');
        return res.data.data;
    }
};

export const useOverviewStats = () => {
    return useQuery({
        queryKey: ['dashboard-overview'],
        queryFn: overviewService.getStats,
    });
};

export const useRecentIncidentsOverview = () => {
    return useQuery({
        queryKey: ['recent-incidents-overview'],
        queryFn: overviewService.getRecentIncidents,
    });
};

export const useZoneStatus = () => {
    return useQuery({
        queryKey: ['zone-status'],
        queryFn: overviewService.getZoneStatus,
    });
};

import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const analyticsService = {
    getData: async () => {
        const res = await api.get('/analytics');
        return res.data.data;
    }
};

export const useAnalytics = () => {
    return useQuery({
        queryKey: ['analytics-data'],
        queryFn: analyticsService.getData,
    });
};

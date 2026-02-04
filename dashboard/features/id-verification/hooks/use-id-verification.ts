import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const idVerificationService = {
    verifyId: async (id: string) => {
        const res = await api.get(`/tourist-id/${id}`);
        return res.data.data;
    }
};

export const useIdVerification = (id: string) => {
    return useQuery({
        queryKey: ['id-verification', id],
        queryFn: () => idVerificationService.verifyId(id),
        enabled: !!id,
    });
};

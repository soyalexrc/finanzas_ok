import {useQuery} from "@tanstack/react-query";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {Category} from "@/lib/store/features/transactions/categories.slice";

export const useCategories = (userId: string, token: string) => {
    return useQuery({
        queryKey: ['categories'],
        enabled: false,
        queryFn: async (): Promise<Category[]> => {
            const response = await api.post(endpoints.categories.listByUser, {
                userId
            }, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            return response.data;
        }
    })
}

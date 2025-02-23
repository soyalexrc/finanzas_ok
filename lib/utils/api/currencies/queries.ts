import {useQuery} from "@tanstack/react-query";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {CurrencyV2} from "@/lib/store/features/transactions/currencies.slice";

export const useCurrencies = (token: string) => {
    return useQuery({
        queryKey: ['currencies'],
        enabled: false,
        queryFn: async (): Promise<CurrencyV2[]> => {
            const response = await api.get(endpoints.currencies.list, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            return response.data;
        }
    })
}

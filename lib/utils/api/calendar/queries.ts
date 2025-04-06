import {useQuery} from "@tanstack/react-query";
import api from "@/lib/utils/api";
import endpoints from "@/lib/utils/api/endpoints";
import {Category} from "@/lib/store/features/transactions/categories.slice";
import {transformEventsToCalendarFormat} from "@/lib/helpers/calendar";

export const useCalendarEvents = (userId: string, token: string, startDate: string, endDate: string) => {
    return useQuery({
        queryKey: ['calendarEvents', startDate, endDate],
        staleTime: 1000 * 60 * 60 * 14, // Cache for 24 Hours
        queryFn: async (): Promise<any> => {
            const response = await api.get<any[]>(`${endpoints.calendar.list}`, {
                params: {
                    startDate,
                    endDate,
                    userId
                },
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            return transformEventsToCalendarFormat(response.data);
        }
    })
}

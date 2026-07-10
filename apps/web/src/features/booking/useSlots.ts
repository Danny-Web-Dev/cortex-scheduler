import { useQuery } from '@tanstack/react-query';
import { getSlots, queryKeys } from '@/lib';

export const useSlots = (doctorId: string, date: string) =>
  useQuery({
    queryKey: queryKeys.slots(doctorId, date),
    queryFn: () => getSlots(doctorId, date),
    enabled: doctorId.length > 0 && date.length > 0,
  });

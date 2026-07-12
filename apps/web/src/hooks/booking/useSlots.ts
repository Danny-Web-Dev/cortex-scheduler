import { useQuery } from '@tanstack/react-query';
import { client } from '@/api';
import { queryKeys } from '@/config';

export const useSlots = (doctorId: string, date: string) =>
  useQuery({
    queryKey: queryKeys.slots(doctorId, date),
    queryFn: () => client.catalog.getSlots(doctorId, date),
    enabled: doctorId.length > 0 && date.length > 0,
  });

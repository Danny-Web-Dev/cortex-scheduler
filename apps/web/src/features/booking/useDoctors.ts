import { useQuery } from '@tanstack/react-query';
import { listDoctors, queryKeys } from '@/lib';

export const useDoctors = (specialtyId: string) =>
  useQuery({
    queryKey: queryKeys.doctors(specialtyId),
    queryFn: () => listDoctors(specialtyId),
    enabled: specialtyId.length > 0,
  });

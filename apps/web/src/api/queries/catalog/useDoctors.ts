import { useQuery } from '@tanstack/react-query';
import { client } from '@/api';
import { queryKeys } from '@/config';

export const useDoctors = (specialtyId: string) =>
  useQuery({
    queryKey: queryKeys.doctors(specialtyId),
    queryFn: () => client.catalog.listDoctors(specialtyId),
    enabled: specialtyId.length > 0,
  });

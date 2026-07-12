import { useQuery } from '@tanstack/react-query';
import { client } from '@/api';
import { queryKeys } from '@/config';

export const useSpecialties = () =>
  useQuery({
    queryKey: queryKeys.specialties(),
    queryFn: client.catalog.listSpecialties,
  });

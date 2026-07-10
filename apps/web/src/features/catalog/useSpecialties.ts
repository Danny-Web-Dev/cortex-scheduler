import { useQuery } from '@tanstack/react-query';
import { listSpecialties, queryKeys } from '@/lib';

export const useSpecialties = () =>
  useQuery({
    queryKey: queryKeys.specialties(),
    queryFn: listSpecialties,
  });

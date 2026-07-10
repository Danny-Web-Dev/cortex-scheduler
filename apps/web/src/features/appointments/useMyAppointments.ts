import { useQuery } from '@tanstack/react-query';
import type { AppointmentScope } from '@cortex/shared';
import { listMyAppointments, queryKeys } from '@/lib';

export const useMyAppointments = (scope: AppointmentScope) =>
  useQuery({
    queryKey: queryKeys.myAppointments(scope),
    queryFn: () => listMyAppointments(scope),
  });

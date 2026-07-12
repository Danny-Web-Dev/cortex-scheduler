import { useQuery } from '@tanstack/react-query';
import type { AppointmentScope } from '@cortex/shared';
import { client } from '@/api';
import { queryKeys } from '@/config';

export const useMyAppointments = (scope: AppointmentScope) =>
  useQuery({
    queryKey: queryKeys.myAppointments(scope),
    queryFn: () => client.appointments.listMine(scope),
  });

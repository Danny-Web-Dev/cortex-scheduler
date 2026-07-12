export const ENDPOINTS = {
  auth: {
    otpRequest: '/auth/otp/request',
    otpVerify: '/auth/otp/verify',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  catalog: {
    specialties: '/specialties',
    doctorsBySpecialty: (specialtyId: string): string => `/specialties/${specialtyId}/doctors`,
    slotsByDoctor: (doctorId: string, date: string): string =>
      `/doctors/${doctorId}/slots?date=${date}`,
  },
  search: {
    query: (q: string): string => `/search?q=${encodeURIComponent(q)}`,
  },
  appointments: {
    hold: '/appointments/hold',
    confirm: (id: string): string => `/appointments/${id}/confirm`,
    releaseHold: (id: string): string => `/appointments/${id}/hold`,
    mine: (scope: string): string => `/me/appointments?scope=${scope}`,
    cancel: (id: string): string => `/appointments/${id}/cancel`,
    reschedule: (id: string): string => `/appointments/${id}/reschedule`,
  },
  users: {
    profile: '/me/profile',
  },
} as const;

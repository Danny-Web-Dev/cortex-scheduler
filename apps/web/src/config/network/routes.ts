type BookDoctorParams = { specialtyId: string };
type BookSlotParams = { specialtyId: string; doctorId: string };
type RescheduleSlotParams = { rescheduleId: string; doctorId: string; specialtyId: string };

// Single source of truth for every frontend page route. Backend endpoint
// paths live separately in api/endpoints.ts — these are what the browser
// navigates to, not what it calls over HTTP.
export const ROUTES = {
  root: '/',
  login: '/login',
  dashboard: '/dashboard',
  appointments: '/appointments',
  book: {
    root: '/book',
    specialty: '/book/specialty',
    doctor: '/book/doctor',
    slot: '/book/slot',
    confirm: '/book/confirm',
    doctorWithSpecialty: ({ specialtyId }: BookDoctorParams): string =>
      `/book/doctor?specialtyId=${specialtyId}`,
    slotWithDoctor: ({ specialtyId, doctorId }: BookSlotParams): string =>
      `/book/slot?specialtyId=${specialtyId}&doctorId=${doctorId}`,
    slotForReschedule: ({ rescheduleId, doctorId, specialtyId }: RescheduleSlotParams): string =>
      `/book/slot?rescheduleId=${rescheduleId}&doctorId=${doctorId}&specialtyId=${specialtyId}`,
  },
} as const;

// The /book router children are nested under the /book parent route and use
// relative segments, not absolute paths — named here so router.tsx never
// hardcodes a bare string either.
export const BOOK_STEP_SEGMENT = {
  specialty: 'specialty',
  doctor: 'doctor',
  slot: 'slot',
  confirm: 'confirm',
} as const;

export const ROUTE_PARAMS = {
  specialtyId: 'specialtyId',
  doctorId: 'doctorId',
  rescheduleId: 'rescheduleId',
} as const;

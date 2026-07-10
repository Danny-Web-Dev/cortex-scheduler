import { z } from 'zod';
import { DoctorSchema, SpecialtySchema } from './appointment';

export const SEARCH_MIN_LENGTH = 2;

export const SearchQuerySchema = z.object({
  q: z.string().trim().min(SEARCH_MIN_LENGTH).max(100),
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// Doctors in search results carry their specialty name for context.
export const SearchDoctorSchema = DoctorSchema.extend({ specialtyName: z.string() });
export type SearchDoctor = z.infer<typeof SearchDoctorSchema>;

export const SearchResultSchema = z.object({
  specialties: z.array(SpecialtySchema),
  doctors: z.array(SearchDoctorSchema),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

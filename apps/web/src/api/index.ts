// Curated barrel: only `client` and `ApiError` are public. http.ts/endpoints.ts
// stay private to this folder so every request goes through client.<domain>.<method>().
export * from './client';
export * from '../config/network/error.ts';

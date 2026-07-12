export type RequestOptions = {
  method?: string;
  body?: unknown;
  // Public endpoints skip the Authorization header and the refresh dance.
  auth?: boolean;
};

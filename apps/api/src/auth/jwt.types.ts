export type JwtPayload = {
  sub: string;
  phone: string;
};

export type AuthenticatedUser = {
  id: string;
  phone: string;
};

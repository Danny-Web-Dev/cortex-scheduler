import type { AuthTokens } from '@cortex/shared';

export type JwtPayload = {
  sub: string;
  phone: string;
};

export type AuthenticatedUser = {
  id: string;
  phone: string;
};

export type IssuedRefreshToken = {
  token: string;
  expiresAt: Date;
};

export type RotatedTokens = {
  accessToken: string;
  refreshToken: IssuedRefreshToken;
  user: { id: string; phone: string; name: string | null };
};

export type LoginResult = {
  tokens: AuthTokens;
  refreshToken: IssuedRefreshToken;
};

export type VerifyResult = LoginResult & { isNewUser: boolean };

export type CreateOtp = { phone: string; codeHash: string; expiresAt: Date };

export type CreateRefreshToken = {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
};

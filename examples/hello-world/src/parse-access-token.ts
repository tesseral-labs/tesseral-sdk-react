interface AccessTokenClaims {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  nbf: number;
  iat: number;
  session: {
    id: string;
  };
  user: {
    id: string;
    organizationId: string;
    email: string;
  };
  organization: {
    id: string;
    displayName: string;
  };
}

export function parseAccessToken(
  accessToken: string,
): AccessTokenClaims | undefined {
  const parts = accessToken.split(".");
  try {
    return JSON.parse(atob(parts[1])) as AccessTokenClaims;
  } catch {
    return undefined;
  }
}

import { AccessTokenClaims } from "@tesseral/tesseral-vanilla-clientside/api";

export function parseAccessToken(accessToken: string): AccessTokenClaims {
  const claimsPart = accessToken.split(".")[1];
  const decodedClaims = new TextDecoder().decode(
    Uint8Array.from(atob(claimsPart), (c) => c.charCodeAt(0)),
  );
  return JSON.parse(decodedClaims) as AccessTokenClaims;
}

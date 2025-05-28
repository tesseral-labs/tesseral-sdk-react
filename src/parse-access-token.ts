import { AccessTokenClaims } from "@tesseral/tesseral-vanilla-clientside/api";

export function parseAccessToken(accessToken: string): AccessTokenClaims {
  const claimsPart = accessToken.split(".")[1];
  const decodedClaims = Buffer.from(claimsPart.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
  return JSON.parse(decodedClaims) as AccessTokenClaims;
}

import { AccessTokenClaims } from "@tesseral/tesseral-vanilla-clientside/api";

export function parseAccessToken(accessToken: string): AccessTokenClaims {
  const claimsPart = accessToken.split(".")[1];
  const decodedClaims = base64URLDecode(claimsPart);
  return JSON.parse(decodedClaims) as AccessTokenClaims;
}

function base64URLDecode(encoded: string): string {
  // Normalize to standard base64
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if necessary
  const padding = encoded.length % 4;
  if (padding) {
    encoded += "=".repeat(4 - padding);
  }

  encoded = atob(encoded);

  const bytes = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    bytes[i] = encoded.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

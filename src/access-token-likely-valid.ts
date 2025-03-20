import { AccessTokenClaims } from "@tesseral/tesseral-vanilla-clientside/api";
import { useMemo } from "react";

import { useDebouncedNow } from "./use-debounced-now";

const ACCESS_TOKEN_EXPIRY_BUFFER_MILLIS = 10 * 1000;

export function useAccessTokenLikelyValid(accessToken: string): boolean {
  const now = useDebouncedNow(10 * 1000); // re-check expiration every 10 seconds
  return useMemo(() => {
    if (!accessToken) {
      return false;
    }
    const parsedAccessToken = parseAccessToken(accessToken);
    return (
      parsedAccessToken.exp! * 1000 > now - ACCESS_TOKEN_EXPIRY_BUFFER_MILLIS
    );
  }, [accessToken, now]);
}

function parseAccessToken(accessToken: string): AccessTokenClaims {
  const claimsPart = accessToken.split(".")[1];
  const decodedClaims = new TextDecoder().decode(
    Uint8Array.from(atob(claimsPart), (c) => c.charCodeAt(0)),
  );
  return JSON.parse(decodedClaims) as AccessTokenClaims;
}

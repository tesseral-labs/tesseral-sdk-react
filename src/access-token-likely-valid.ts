import { useMemo } from "react";

import { parseAccessToken } from "./parse-access-token";
import { useDebouncedNow } from "./use-debounced-now";

const ACCESS_TOKEN_EXPIRY_BUFFER_MILLIS = 10 * 1000;

/**
 * Returns true if the access token is well-formed and expires far enough in
 * the future.
 *
 * @param accessToken
 */
export function useAccessTokenLikelyValid(accessToken: string): boolean {
  const now = useDebouncedNow(2 * 1000); // re-check expiration every 2 seconds
  return useMemo(() => {
    if (!accessToken) {
      return false;
    }
    const parsedAccessToken = parseAccessToken(accessToken);
    return parsedAccessToken.exp! * 1000 > now + ACCESS_TOKEN_EXPIRY_BUFFER_MILLIS;
  }, [accessToken, now]);
}

/**
 * Returns true if the access token is ill-formed or has expired.
 *
 * @param accessToken
 */
export function useAccessTokenLikelyExpired(accessToken: string): boolean {
  const now = useDebouncedNow(2 * 1000); // re-check expiration every 2 seconds
  return useMemo(() => {
    if (!accessToken) {
      return false;
    }
    const parsedAccessToken = parseAccessToken(accessToken);
    return parsedAccessToken.exp! * 1000 < now;
  }, [accessToken, now]);
}

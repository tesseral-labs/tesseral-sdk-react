import { useMemo } from "react";

import { parseAccessToken } from "./parse-access-token";
import { useDebouncedNow } from "./use-debounced-now";

const ACCESS_TOKEN_EXPIRY_BUFFER_MILLIS = 10 * 1000;

export function useAccessTokenLikelyValid(accessToken: string): boolean {
  const now = useDebouncedNow(10 * 1000); // re-check expiration every 10 seconds
  return useMemo(() => {
    if (!accessToken) {
      return false;
    }
    const parsedAccessToken = parseAccessToken(accessToken);
    return parsedAccessToken.exp! * 1000 > now + ACCESS_TOKEN_EXPIRY_BUFFER_MILLIS;
  }, [accessToken, now]);
}

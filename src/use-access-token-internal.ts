import { useAccessTokenState } from "./use-access-token-state";
import { useEffect, useMemo } from "react";
import { TesseralError } from "@tesseral/tesseral-vanilla-clientside";
import { useFrontendApiClient } from "./use-frontend-api-client";
import { useVaultDomain } from "./publishable-key-config";
import { parseAccessToken } from "./parse-access-token";
import { useDebouncedNow } from "./use-debounced-now";

export function useAccessTokenInternal(
  requireLogin: boolean,
): string | undefined {
  const vaultDomain = useVaultDomain();
  const frontendApiClient = useFrontendApiClient();
  const [accessToken, setAccessToken] = useAccessTokenState();
  const parsedAccessToken = useMemo(() => {
    if (!accessToken) {
      return undefined;
    }
    return parseAccessToken(accessToken);
  }, [accessToken]);

  const now = useDebouncedNow(1000 * 60);
  const accessTokenIsLikelyValid = useMemo(() => {
    if (!parsedAccessToken || !parsedAccessToken.exp) {
      return false;
    }
    return parsedAccessToken.exp > now / 1000;
  }, [parsedAccessToken, now]);

  if (requireLogin && !accessTokenIsLikelyValid) {
    return (window.location.href = `https://${vaultDomain}/login`);
  }

  useEffect(() => {
    if (!requireLogin || accessTokenIsLikelyValid) {
      return;
    }

    async function refreshAccessToken() {
      try {
        const { accessToken } = await frontendApiClient.refresh({});
        setAccessToken(accessToken!);
      } catch (e) {
        if (e instanceof TesseralError && e.statusCode === 401) {
          window.location.href = `https://${vaultDomain}/login`;
        }

        throw e;
      }
    }

    refreshAccessToken();
  }, [
    requireLogin,
    accessTokenIsLikelyValid,
    setAccessToken,
    vaultDomain,
    frontendApiClient,
  ]);

  if (accessTokenIsLikelyValid) {
    return accessToken!;
  }

  return undefined;
}

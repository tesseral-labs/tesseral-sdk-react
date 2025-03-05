import { useAccessTokenState } from "./use-access-token-state";
import { useEffect, useMemo } from "react";
import { AccessTokenClaims } from "@tesseral/tesseral-vanilla-clientside/api";
import { TesseralError } from "@tesseral/tesseral-vanilla-clientside";
import { useFrontendApiClient } from "./use-frontend-api-client";
import { useVaultDomain } from "./publishable-key-config";
import { parseAccessToken } from "./parse-access-token";

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

  const accessTokenIsLikelyValid = useMemo(() => {
    if (!parsedAccessToken || !parsedAccessToken.exp) {
      return false;
    }
    return parsedAccessToken.exp > Date.now() / 1000;
  }, [parsedAccessToken]);

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

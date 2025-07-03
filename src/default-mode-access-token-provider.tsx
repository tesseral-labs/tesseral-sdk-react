import { TesseralError } from "@tesseral/tesseral-vanilla-clientside";
import React, { useEffect, useMemo, useState } from "react";

import { useAccessTokenLikelyExpired, useAccessTokenLikelyValid } from "./access-token-likely-valid";
import { getCookie } from "./cookie";
import { InternalAccessTokenContext, InternalAccessTokenContextValue } from "./internal-access-token-context";
import { useProjectId, useVaultDomain } from "./publishable-key-config";
import { useFrontendApiClientInternal } from "./use-frontend-api-client-internal";

export function DefaultModeAccessTokenProvider({ children }: { children?: React.ReactNode }) {
  const accessToken = useAccessToken();
  const frontendApiClient = useFrontendApiClientInternal();

  const contextValue = useMemo(() => {
    return {
      accessToken,
      frontendApiClient,
    };
  }, [accessToken, frontendApiClient]);

  if (!contextValue.accessToken) {
    return null;
  }

  return (
    <InternalAccessTokenContext.Provider value={contextValue as InternalAccessTokenContextValue}>
      {children}
    </InternalAccessTokenContext.Provider>
  );
}

function useAccessToken(): string | undefined {
  const projectId = useProjectId();
  const vaultDomain = useVaultDomain();
  const frontendApiClient = useFrontendApiClientInternal();
  const [accessToken, setAccessToken] = useState<string | undefined>(() => {
    return getCookie(`tesseral_${projectId}_access_token`);
  });

  const [error, setError] = useState<unknown>();
  const accessTokenLikelyValid = useAccessTokenLikelyValid(accessToken ?? "");
  const accessTokenLikelyExpired = useAccessTokenLikelyExpired(accessToken ?? "");

  // whenever the access token is invalid or near-expired, refresh it
  useEffect(() => {
    if (accessTokenLikelyValid) {
      return;
    }

    (async () => {
      try {
        const { accessToken } = await frontendApiClient.refresh({});
        setAccessToken(accessToken);
      } catch (e) {
        if (e instanceof TesseralError && e.statusCode === 401) {
          // our refresh token is no good
          const loginUrl = new URL(`https://${vaultDomain}/login`);
          loginUrl.searchParams.set("redirect-uri", window.location.href);

          window.location.href = loginUrl.toString();
          return;
        }

        setError(e);
      }
    })();
  }, [accessTokenLikelyValid, frontendApiClient, projectId, vaultDomain]);

  if (error) {
    throw error;
  }

  // if the access token is likely expired, don't return it; wait for refresh
  if (accessTokenLikelyExpired) {
    return;
  }
  return accessToken;
}

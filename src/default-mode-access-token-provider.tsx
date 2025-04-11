import { TesseralError } from "@tesseral/tesseral-vanilla-clientside";
import React, { useEffect, useMemo, useState } from "react";

import { useAccessTokenLikelyValid } from "./access-token-likely-valid";
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

  const [error, setError] = useState<unknown>();
  const accessToken = getCookie(`tesseral_${projectId}_access_token`);
  const accessTokenLikelyValid = useAccessTokenLikelyValid(accessToken ?? "");

  // whenever the access token is invalid or near-expired, refresh it
  useEffect(() => {
    if (accessTokenLikelyValid) {
      return;
    }

    (async () => {
      try {
        await frontendApiClient.refresh({});
      } catch (e) {
        if (e instanceof TesseralError && e.statusCode === 401) {
          // our refresh token is no good
          window.location.href = `https://${vaultDomain}/login`;
          return;
        }

        setError(e);
      }
    })();
  }, [accessTokenLikelyValid, frontendApiClient, projectId, vaultDomain]);

  if (error) {
    throw error;
  }

  return accessToken;
}

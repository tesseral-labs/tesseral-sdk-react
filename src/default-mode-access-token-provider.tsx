import { TesseralError } from "@tesseral/tesseral-vanilla-clientside";
import React, { useEffect, useState } from "react";

import { useAccessTokenLikelyValid } from "./access-token-likely-valid";
import { getCookie } from "./cookie";
import { InternalAccessTokenContext } from "./internal-access-token-context";
import { useProjectId, useVaultDomain } from "./publishable-key-config";
import { useFrontendApiClient } from "./use-frontend-api-client";

export function DefaultModeAccessTokenProvider({ children }: { children?: React.ReactNode }) {
  const accessToken = useAccessToken();
  if (!accessToken) {
    return null;
  }

  return <InternalAccessTokenContext value={accessToken}>{children}</InternalAccessTokenContext>;
}

function useAccessToken(): string | undefined {
  const projectId = useProjectId();
  const vaultDomain = useVaultDomain();
  const frontendApiClient = useFrontendApiClient();

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

  if (accessTokenLikelyValid) {
    return accessToken!;
  }
}

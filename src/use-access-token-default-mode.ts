import {
  TesseralClient,
  TesseralError,
} from "@tesseral/tesseral-vanilla-clientside";
import { useEffect, useState } from "react";

import { useAccessTokenLikelyValid } from "./access-token-likely-valid";
import { getCookie } from "./cookie";
import { useProjectId, useVaultDomain } from "./publishable-key-config";
import { useFrontendApiClient } from "./use-frontend-api-client";

export function useAccessTokenDefaultMode({
  enabled,
  requireLogin,
}: {
  enabled: boolean;
  requireLogin: boolean;
}): string | undefined {
  const projectId = useProjectId();
  const vaultDomain = useVaultDomain();
  const frontendApiClient = useFrontendApiClient();

  const [error, setError] = useState<unknown>();
  const accessToken = getCookie(`tesseral_${projectId}_access_token`);
  const accessTokenLikelyValid = useAccessTokenLikelyValid(accessToken ?? "");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    (async () => {
      try {
        await getAccessToken({
          vaultDomain,
          requireLogin,
          frontendApiClient,
        });
      } catch (e) {
        setError(e);
      }
    })();
  }, [enabled, frontendApiClient, requireLogin, vaultDomain]);

  if (error) {
    throw error;
  }

  if (!accessTokenLikelyValid) {
    return undefined;
  }
  return accessToken!;
}

async function getAccessToken({
  vaultDomain,
  requireLogin,
  frontendApiClient,
}: {
  vaultDomain: string;
  requireLogin: boolean;
  frontendApiClient: TesseralClient;
}): Promise<string | undefined> {
  try {
    await frontendApiClient.refresh({});
  } catch (e) {
    if (e instanceof TesseralError && e.statusCode === 401) {
      // our refresh token is no good
      if (requireLogin) {
        window.location.href = `https://${vaultDomain}/login`;
      }
      return;
    }

    throw e;
  }
}

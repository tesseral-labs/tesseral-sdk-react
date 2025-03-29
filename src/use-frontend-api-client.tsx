import { TesseralClient } from "@tesseral/tesseral-vanilla-clientside";
import { fetcher } from "@tesseral/tesseral-vanilla-clientside/core";
import { useMemo } from "react";

import { useAccessToken } from "./hooks";
import { useDevMode, useVaultDomain } from "./publishable-key-config";

export function useFrontendApiClient() {
  const devMode = useDevMode();
  const defaultModeFrontendApiClient = useDefaultModeFrontendApiClient();
  const devModeFrontendApiClient = useDevModeFrontendApiClient();
  return devMode ? devModeFrontendApiClient : defaultModeFrontendApiClient;
}

function useDefaultModeFrontendApiClient() {
  const vaultDomain = useVaultDomain();

  return useMemo(() => {
    return new TesseralClient({
      environment: `https://${vaultDomain}`,
    });
  }, [vaultDomain]);
}

function useDevModeFrontendApiClient() {
  const vaultDomain = useVaultDomain();
  const accessToken = useAccessToken();

  return useMemo(() => {
    return new TesseralClient({
      environment: `https://${vaultDomain}`,
      fetcher: (options) =>
        fetcher({
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${accessToken}` },
        }),
    });
  }, [accessToken, vaultDomain]);
}

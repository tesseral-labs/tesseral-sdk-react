import { useCallback } from "react";

import { useFrontendApiClient } from "./use-frontend-api-client";

export function useDefaultModeLogout() {
  const frontendApiClient = useFrontendApiClient();

  return useCallback(async () => {
    // revoke session; vault will clear cookies
    await frontendApiClient.logout({});
  }, [frontendApiClient]);
}

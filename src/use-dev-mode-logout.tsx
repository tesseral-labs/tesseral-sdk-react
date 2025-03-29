import { useCallback } from "react";

import { useAccessTokenLocalStorage } from "./use-access-token-localstorage";
import { useFrontendApiClient } from "./use-frontend-api-client";
import { useRefreshTokenLocalStorage } from "./use-refresh-token-localstorage";

export function useDevModeLogout() {
  const frontendApiClient = useFrontendApiClient();
  const [, setAccessTokenLocalStorage] = useAccessTokenLocalStorage();
  const [, setRefreshTokenLocalStorage] = useRefreshTokenLocalStorage();

  return useCallback(async () => {
    // revoke session
    await frontendApiClient.logout({});

    // clear local state
    setAccessTokenLocalStorage(null);
    setRefreshTokenLocalStorage(null);
  }, [frontendApiClient, setAccessTokenLocalStorage, setRefreshTokenLocalStorage]);
}

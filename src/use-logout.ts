import { useCallback } from "react";

import { useAccessTokenLocalStorage } from "./use-access-token-localstorage";
import { useFrontendApiClient } from "./use-frontend-api-client";
import { useRefreshTokenLocalStorage } from "./use-refresh-token-localstorage";

export function useLogout(): () => void {
  const frontendApiClient = useFrontendApiClient();
  const [, setRefreshTokenLocalStorage] = useRefreshTokenLocalStorage();
  const [, setAccessTokenLocalStorage] = useAccessTokenLocalStorage();

  return useCallback(() => {
    async function logout() {
      await frontendApiClient.logout({});

      // clear out any dev mode localstorage state
      setRefreshTokenLocalStorage(null);
      setAccessTokenLocalStorage(null);
    }

    void logout();
  }, [
    frontendApiClient,
    setAccessTokenLocalStorage,
    setRefreshTokenLocalStorage,
  ]);
}

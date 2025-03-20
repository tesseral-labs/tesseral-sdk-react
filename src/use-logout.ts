import { useCallback } from "react";

import { useProjectId } from "./publishable-key-config";
import { useFrontendApiClient } from "./use-frontend-api-client";
import { useLocalStorage } from "./use-localstorage";

export function useLogout(): () => void {
  const projectId = useProjectId();
  const frontendApiClient = useFrontendApiClient();
  const [, setAccessToken] = useLocalStorage(
    `tesseral_${projectId}_access_token`,
  );

  return useCallback(() => {
    async function logout() {
      await frontendApiClient.logout({});
      setAccessToken(null);
    }

    logout();
  }, [frontendApiClient, setAccessToken]);
}

import { useProjectId, useVaultDomain } from "./publishable-key-config";
import { useFrontendApiClient } from "./use-frontend-api-client";
import { useLocalStorage } from "./use-localstorage";
import { useCallback } from "react";

export function useLogout(): () => void {
  const projectId = useProjectId();
  const vaultDomain = useVaultDomain();
  const frontendApiClient = useFrontendApiClient();
  const [_, setAccessToken] = useLocalStorage(
    `tesseral_${projectId}_access_token`,
  );

  return useCallback(() => {
    async function logout() {
      await frontendApiClient.logout({});
      setAccessToken(null);
    }

    logout();
  }, [setAccessToken, vaultDomain]);
}

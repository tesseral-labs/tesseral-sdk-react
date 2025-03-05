import { useProjectId, useVaultDomain } from "./publishable-key-config";
import { useFrontendApiClient } from "./use-frontend-api-client";
import { useLocalStorage } from "./use-localstorage";

export function useAccessTokenState(): [
  string | null,
  (accessToken: string | null) => void,
] {
  const projectId = useProjectId();
  return useLocalStorage(`tesseral_${projectId}_access_token`);
}

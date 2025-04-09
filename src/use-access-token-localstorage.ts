import { useProjectId } from "./publishable-key-config";
import { useLocalStorage } from "./use-localstorage";

export function useAccessTokenLocalStorage(): [string | null, (accessToken: string | null) => void] {
  const projectId = useProjectId();
  return useLocalStorage(`tesseral_${projectId}_access_token`);
}

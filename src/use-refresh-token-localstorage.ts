import { useProjectId } from "./publishable-key-config";
import { useLocalStorage } from "./use-localstorage";

export function useRefreshTokenLocalStorage(): [string | null, (refreshToken: string | null) => void] {
  const projectId = useProjectId();
  return useLocalStorage(`tesseral_${projectId}_refresh_token`);
}

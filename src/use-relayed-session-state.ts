import { useProjectId } from "./publishable-key-config";
import { useLocalStorage } from "./use-localstorage";

export function useRelayedSessionState(): [string | null, (state: string | null) => void] {
  const projectId = useProjectId();
  return useLocalStorage(`tesseral_${projectId}_relayed_session_state`);
}

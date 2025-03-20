import { useMemo } from "react";

import { useProjectId } from "./publishable-key-config";

export function useExtractRelayedSessionToken(): string | undefined {
  const projectId = useProjectId();

  // useMemo here acts as a way to avoid repeating a side effect
  return useMemo(() => {
    const prefix = `#__tesseral_${projectId}_relayed_session_token=`;
    if (window.location.hash.startsWith(prefix)) {
      const token = window.location.hash.substring(prefix.length);

      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      return token;
    }
  }, [projectId]);
}

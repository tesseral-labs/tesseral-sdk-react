import { useCallback } from "react";

import { useDevMode, useVaultDomain } from "./publishable-key-config";
import { sha256 } from "./sha256";
import { useRelayedSessionState } from "./use-relayed-session-state";

export function useRedirectToVaultLogin(): () => void {
  const vaultDomain = useVaultDomain();
  const devMode = useDevMode();
  const [, setRelayedSessionState] = useRelayedSessionState();

  return useCallback(async () => {
    const url = new URL(`https://${vaultDomain}/login`);
    if (devMode) {
      const csrfToken = crypto.randomUUID();
      url.searchParams.append("relayed-session-state", csrfToken);
      setRelayedSessionState(await sha256(csrfToken));
    }

    window.location.href = url.toString();
  }, [setRelayedSessionState, devMode, vaultDomain]);
}

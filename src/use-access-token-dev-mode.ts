import {
  TesseralClient,
  TesseralError,
} from "@tesseral/tesseral-vanilla-clientside";
import { useEffect, useState } from "react";

import { useAccessTokenLikelyValid } from "./access-token-likely-valid";
import { useProjectId, useVaultDomain } from "./publishable-key-config";
import { sha256 } from "./sha256";
import { useAccessTokenLocalStorage } from "./use-access-token-localstorage";
import { useFrontendApiClient } from "./use-frontend-api-client";

export function useAccessTokenDevMode({
  enabled,
  requireLogin,
}: {
  enabled: boolean;
  requireLogin: boolean;
}): string | undefined {
  const projectId = useProjectId();
  const vaultDomain = useVaultDomain();
  const frontendApiClient = useFrontendApiClient();

  const [error, setError] = useState<unknown>();
  const [accessToken, setAccessToken] = useAccessTokenLocalStorage();
  const accessTokenLikelyValid = useAccessTokenLikelyValid(accessToken ?? "");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    (async () => {
      try {
        setAccessToken(
          (await getAccessToken({
            projectId,
            vaultDomain,
            requireLogin,
            frontendApiClient,
          })) ?? null,
        );
      } catch (e) {
        setError(e);
      }
    })();
  }, [
    enabled,
    frontendApiClient,
    projectId,
    requireLogin,
    setAccessToken,
    vaultDomain,
  ]);

  if (error) {
    throw error;
  }

  if (!accessTokenLikelyValid) {
    return undefined;
  }
  return accessToken!;
}

async function getAccessToken({
  projectId,
  vaultDomain,
  requireLogin,
  frontendApiClient,
}: {
  projectId: string;
  vaultDomain: string;
  requireLogin: boolean;
  frontendApiClient: TesseralClient;
}): Promise<string | undefined> {
  // handle relayed sessions, if any
  const relayedSessionToken = getRelayedSessionToken({ projectId });
  if (relayedSessionToken) {
    const response = await fetch(
      `https://${vaultDomain}/api/intermediate/v1/exchange-relayed-session-token-for-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          relayedSessionToken: relayedSessionToken!,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to exchange relayed session token for session: ${response.statusText}`,
      );
    }

    const {
      refreshToken,
      accessToken,
      relayedSessionState: relayedSessionStateFromExchange,
    } = await response.json();

    const savedRelayedSessionStateSHA256 = localStorage.getItem(
      `tesseral_${projectId}_relayed_session_state`,
    );
    if (
      (await sha256(relayedSessionStateFromExchange)) !=
      savedRelayedSessionStateSHA256
    ) {
      throw new Error("Relayed session state does not match expected value");
    }

    localStorage.removeItem(`tesseral_${projectId}_relayed_session_state`);
    localStorage.setItem(`tesseral_${projectId}_refresh_token`, refreshToken);
    return accessToken;
  }

  const refreshToken = localStorage.getItem(
    `tesseral_${projectId}_refresh_token`,
  );
  if (!refreshToken) {
    // we don't have a refresh token
    if (requireLogin) {
      await redirectToVaultLogin({ projectId, vaultDomain });
    }
    return;
  }

  try {
    const { accessToken } = await frontendApiClient.refresh({
      refreshToken,
    });
    return accessToken;
  } catch (e) {
    if (e instanceof TesseralError && e.statusCode === 401) {
      // our refresh token is no good
      if (requireLogin) {
        await redirectToVaultLogin({ projectId, vaultDomain });
      }
      return;
    }

    throw e;
  }
}

function getRelayedSessionToken({ projectId }: { projectId: string }) {
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
}

async function redirectToVaultLogin({
  projectId,
  vaultDomain,
}: {
  projectId: string;
  vaultDomain: string;
}) {
  const url = new URL(`https://${vaultDomain}/login`);
  const csrfToken = crypto.randomUUID();
  url.searchParams.append("relayed-session-state", csrfToken);
  localStorage.setItem(
    `tesseral_${projectId}_relayed_session_state`,
    await sha256(csrfToken),
  );
  window.location.href = url.toString();
}

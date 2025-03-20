import { TesseralError } from "@tesseral/tesseral-vanilla-clientside";
import { useEffect, useMemo, useState } from "react";

import { parseAccessToken } from "./parse-access-token";
import {
  useProjectId,
  useSupportRelayedSessions,
  useVaultDomain,
} from "./publishable-key-config";
import { extractRelayedSessionToken } from "./relayed-sessions";
import { useAccessTokenState } from "./use-access-token-state";
import { useDebouncedNow } from "./use-debounced-now";
import { useFrontendApiClient } from "./use-frontend-api-client";

export function useAccessTokenInternal(
  requireLogin: boolean,
): string | undefined {
  const vaultDomain = useVaultDomain();
  const projectId = useProjectId();
  const supportRelayedSessions = useSupportRelayedSessions();
  const frontendApiClient = useFrontendApiClient();
  const [accessToken, setAccessToken] = useAccessTokenState();

  const relayedSessionToken = useMemo(() => {
    return extractRelayedSessionToken();
  }, []);

  const parsedAccessToken = useMemo(() => {
    if (!accessToken) {
      return undefined;
    }
    return parseAccessToken(accessToken);
  }, [accessToken]);

  const now = useDebouncedNow(1000 * 60);
  const accessTokenIsLikelyValid = useMemo(() => {
    if (!parsedAccessToken || !parsedAccessToken.exp) {
      return false;
    }
    return parsedAccessToken.exp > now / 1000;
  }, [parsedAccessToken, now]);

  useEffect(() => {
    if (accessTokenIsLikelyValid) {
      return;
    }

    async function exchangeRelayedSessionToken() {
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

      const { refreshToken, accessToken, relayedSessionState } =
        await response.json();

      if (
        (await sha256(relayedSessionState)) !=
        localStorage.getItem(`tesseral_${projectId}_relayed_session_state`)
      ) {
        throw new Error("Relayed session state does not match expected value");
      }

      setAccessToken(accessToken!);
    }

    async function refreshAccessToken() {
      try {
        const { accessToken } = await frontendApiClient.refresh({});
        setAccessToken(accessToken!);
      } catch (e) {
        if (e instanceof TesseralError && e.statusCode === 401) {
          if (requireLogin) {
            await redirectToVaultLogin(
              projectId,
              vaultDomain,
              supportRelayedSessions,
            );
          } else {
            return; // we're ok with not having a user on hand
          }
        }

        throw e;
      }
    }

    if (supportRelayedSessions && relayedSessionToken) {
      void exchangeRelayedSessionToken();
    } else {
      void refreshAccessToken();
    }
  }, [
    requireLogin,
    accessTokenIsLikelyValid,
    setAccessToken,
    vaultDomain,
    frontendApiClient,
    projectId,
    supportRelayedSessions,
    relayedSessionToken,
  ]);

  if (accessTokenIsLikelyValid) {
    return accessToken!;
  }

  return undefined;
}

async function redirectToVaultLogin(
  projectId: string,
  vaultDomain: string,
  useRelayedSession: boolean,
) {
  const url = new URL(`https://${vaultDomain}/login`);
  if (useRelayedSession) {
    const csrfToken = crypto.randomUUID();
    url.searchParams.append("relayed-session-state", csrfToken);

    localStorage.setItem(
      `tesseral_${projectId}_relayed_session_state`,
      await sha256(csrfToken),
    );
  }

  window.location.href = url.toString();
}

async function sha256(data: string): Promise<string> {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(data),
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

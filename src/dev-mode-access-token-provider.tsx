import { TesseralError } from "@tesseral/tesseral-vanilla-clientside";
import React, { useEffect, useRef, useState } from "react";

import { useAccessTokenLikelyValid } from "./access-token-likely-valid";
import { setCookie } from "./cookie";
import { InternalAccessTokenContext } from "./internal-access-token-context";
import { useProjectId, useVaultDomain } from "./publishable-key-config";
import { sha256 } from "./sha256";
import { useAccessTokenLocalStorage } from "./use-access-token-localstorage";
import { useFrontendApiClient } from "./use-frontend-api-client";
import { useRefreshTokenLocalStorage } from "./use-refresh-token-localstorage";
import { useRelayedSessionState } from "./use-relayed-session-state";

export function DevModeAccessTokenProvider({ children }: { children?: React.ReactNode }) {
  const accessToken = useAccessToken();
  if (!accessToken) {
    return null;
  }

  return <InternalAccessTokenContext value={accessToken}>{children}</InternalAccessTokenContext>;
}

function useAccessToken(): string | undefined {
  const projectId = useProjectId();
  const vaultDomain = useVaultDomain();
  const frontendApiClient = useFrontendApiClient();

  const [relayedSessionState, setRelayedSessionState] = useRelayedSessionState();
  const [refreshToken, setRefreshToken] = useRefreshTokenLocalStorage();
  const [accessToken, setAccessToken] = useAccessTokenLocalStorage();

  // Begin in "processing relayed session" mode. While in this mode, we're ok
  // with not having a refresh token.
  //
  // We exit this mode if there is no relayed session token, or when we're done
  // exchanging the relayed session token.
  const [processingRelayedSession, setProcessingRelayedSession] = useState(true);
  const strictModeDedupeRelayedSession = useRef(false);

  const accessTokenLikelyValid = useAccessTokenLikelyValid(accessToken ?? "");

  const [error, setError] = useState<unknown>();

  // look for a relayed session token; this effect only runs once
  useEffect(() => {
    // React's StrictMode causes all useEffect callbacks to run twice. We don't
    // want that to happen here, because want to create a Promise that does
    // non-idempotent work. Simplest is to avoid creating multiple such
    // Promises.
    //
    // So here, we use a ref to detect whether this is the first time this
    // useAccessToken hook is trying to detect a relayed session, and aborts if
    // it isn't.
    if (strictModeDedupeRelayedSession.current) {
      return;
    }
    strictModeDedupeRelayedSession.current = true;

    (async () => {
      try {
        const result = await handleRelayedSession({ vaultDomain, projectId });
        if (result) {
          setRefreshToken(result.refreshToken);
          setAccessToken(result.accessToken);
        }
        setProcessingRelayedSession(false);
      } catch (e) {
        setError(e);
      }
    })();
  }, [vaultDomain, projectId, setRefreshToken, setAccessToken]);

  // whenever the access token is invalid or near-expired, refresh it
  useEffect(() => {
    // do not run refresh until relayed sessions have a chance to run their
    // course
    if (processingRelayedSession) {
      return;
    }

    if (accessTokenLikelyValid) {
      return;
    }

    (async () => {
      if (!refreshToken) {
        await redirectToVaultLogin({ projectId, vaultDomain });
        return; // appease typescript
      }

      try {
        const { accessToken } = await frontendApiClient.refresh({
          refreshToken,
        });

        setAccessToken(accessToken!);
      } catch (e) {
        if (e instanceof TesseralError && e.statusCode === 401) {
          // our refresh token is no good
          await redirectToVaultLogin({ projectId, vaultDomain });
          return;
        }

        setError(e);
      }
    })();
  }, [
    accessTokenLikelyValid,
    frontendApiClient,
    processingRelayedSession,
    projectId,
    refreshToken,
    setAccessToken,
    vaultDomain,
  ]);

  // manually set a local cookie when the access token is valid
  useEffect(() => {
    if (!accessTokenLikelyValid) {
      return;
    }
    setCookie(`tesseral_${projectId}_access_token`, accessToken!);
  }, [accessToken, accessTokenLikelyValid, projectId]);

  if (error) {
    throw error;
  }

  if (accessTokenLikelyValid) {
    return accessToken!;
  }
}

async function handleRelayedSession({
  vaultDomain,
  projectId,
}: {
  vaultDomain: string;
  projectId: string;
}): Promise<{ accessToken: string; refreshToken: string } | undefined> {
  const prefix = `#__tesseral_${projectId}_relayed_session_token=`;
  if (!window.location.hash.startsWith(prefix)) {
    return;
  }

  const relayedSessionToken = window.location.hash.substring(prefix.length);

  // remove hash from window.location
  history.replaceState(null, "", window.location.pathname + window.location.search);

  const {
    refreshToken,
    accessToken,
    relayedSessionState: relayedSessionStateFromExchange,
  } = await exchangeRelayedSessionToken({
    vaultDomain,
    relayedSessionToken,
  });

  const exchangeStateSHA256 = await sha256(relayedSessionStateFromExchange);
  const savedState = localStorage.getItem(`tesseral_${projectId}_relayed_session_state`);
  if (exchangeStateSHA256 !== savedState) {
    throw new Error("Relayed session state does not match expected value");
  }

  return { refreshToken, accessToken };
}

async function exchangeRelayedSessionToken({
  vaultDomain,
  relayedSessionToken,
}: {
  vaultDomain: string;
  relayedSessionToken: string;
}): Promise<{
  refreshToken: string;
  accessToken: string;
  relayedSessionState: string;
}> {
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
    throw new Error(`Failed to exchange relayed session token for session: ${response.statusText}`);
  }

  const { refreshToken, accessToken, relayedSessionState } = await response.json();
  return { refreshToken, accessToken, relayedSessionState };
}

async function redirectToVaultLogin({ projectId, vaultDomain }: { projectId: string; vaultDomain: string }) {
  const relayedSessionState = crypto.randomUUID();
  localStorage.setItem(`tesseral_${projectId}_relayed_session_state`, await sha256(relayedSessionState));
  window.location.href = `https://${vaultDomain}/login?relayed-session-state=${relayedSessionState}`;
}

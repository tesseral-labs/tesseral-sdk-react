import React, { useCallback, useEffect, useMemo } from "react";
import {
  PublishableKeyConfigProvider,
  useProjectId,
  useVaultDomain,
} from "./publishable-key-config";
import { useLocalStorage } from "./use-localstorage";
import { parseAccessToken } from "./parse-access-token";
import { TesseralContext } from "./context";
import { useFrontendApiClient } from "./use-frontend-api-client";
import { TesseralError } from "@tesseral/tesseral-vanilla-clientside";

interface TesseralProviderProps {
  publishableKey: string;
  configApiHostname: string;
  children?: React.ReactNode;
}

export function TesseralProvider({
  publishableKey,
  configApiHostname = "config.tesseral.com",
  children,
}: TesseralProviderProps) {
  return (
    <PublishableKeyConfigProvider
      publishableKey={publishableKey}
      configApiHostname={configApiHostname}
    >
      <TesseralProviderInner>{children}</TesseralProviderInner>
    </PublishableKeyConfigProvider>
  );
}

function TesseralProviderInner({ children }: { children?: React.ReactNode }) {
  const projectId = useProjectId();
  const vaultDomain = useVaultDomain();
  const accessToken = useAccessToken();
  const parsedAccessToken = useMemo(() => {
    if (!accessToken) {
      return undefined;
    }
    return parseAccessToken(accessToken);
  }, [accessToken]);

  if (!accessToken || !parsedAccessToken) {
    return null;
  }

  return (
    <TesseralContext.Provider
      value={{
        projectId,
        vaultDomain,
        accessToken,
        organization: parsedAccessToken.organization,
        user: parsedAccessToken.user,
        session: parsedAccessToken.session,
      }}
    >
      {children}
    </TesseralContext.Provider>
  );
}

function useAccessToken(): string | null {
  const projectId = useProjectId();
  const vaultDomain = useVaultDomain();
  const frontendApiClient = useFrontendApiClient();
  const [accessToken, setAccessToken] = useLocalStorage(
    `tesseral_${projectId}_access_token`,
  );

  const parsedAccessToken = useMemo(() => {
    if (!accessToken) {
      return undefined;
    }
    return parseAccessToken(accessToken);
  }, [accessToken]);

  const accessTokenIsLikelyValid = useMemo(() => {
    if (!parsedAccessToken) {
      return false;
    }
    return parsedAccessToken.exp > Date.now() / 1000;
  }, [parsedAccessToken]);

  useEffect(() => {
    if (accessTokenIsLikelyValid) {
      return;
    }

    async function refreshAccessToken() {
      try {
        const { accessToken } = await frontendApiClient.refresh({});
        setAccessToken(accessToken!);
      } catch (e) {
        if (e instanceof TesseralError && e.statusCode === 401) {
          window.location.href = `https://${vaultDomain}/login`;
        }

        throw e;
      }
    }

    refreshAccessToken();
  }, [accessTokenIsLikelyValid]);

  return accessToken;
}

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

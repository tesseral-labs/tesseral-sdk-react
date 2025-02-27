import React, { useEffect, useMemo } from "react";
import {
  PublishableKeyConfigProvider,
  useProjectId,
  useVaultDomain,
} from "@/publishable-key-config";
import { useLocalStorage } from "@/use-localstorage";
import { useFetch } from "@/use-fetch";
import { parseAccessToken } from "@/parse-access-token";
import { TesseralContext } from "@/context";

interface TesseralProviderProps {
  publishableKey: string;
  configApiHostname?: string;
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

const REFRESH_TOKEN_FETCH_PARAMS = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: "{}",
  credentials: "include" as const,
};

function useAccessToken(): string | undefined {
  const projectId = useProjectId();
  const vaultDomain = useVaultDomain();
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
      const response = await fetch(
        `https://${vaultDomain}/api/frontend/v1/refresh`,
        REFRESH_TOKEN_FETCH_PARAMS,
      );
      if (response.status === 401) {
        window.location.href = `https://${vaultDomain}/login`;
      }

      if (response.status !== 200) {
        throw new Error(
          `Unexpected response from refresh endpoint: ${response.status}`,
        );
      }

      const body = await response.json();
      setAccessToken(body.accessToken);
    }

    refreshAccessToken();
  }, [accessTokenIsLikelyValid]);

  return accessToken;
}

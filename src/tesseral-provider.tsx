import React, { useMemo } from "react";
import {
  PublishableKeyConfigProvider,
  useProjectId,
  useVaultDomain,
} from "./publishable-key-config";
import { TesseralContext } from "./tesseral-context";
import { useAccessTokenInternal } from "./use-access-token-internal";
import { parseAccessToken } from "./parse-access-token";
import { useFrontendApiClient } from "./use-frontend-api-client";

interface TesseralProviderProps {
  publishableKey: string;
  requireLogin: boolean;
  configApiHostname: string;
  children?: React.ReactNode;
}

export function TesseralProvider({
  publishableKey,
  requireLogin = true,
  configApiHostname = "config.tesseral.com",
  children,
}: TesseralProviderProps) {
  return (
    <PublishableKeyConfigProvider
      publishableKey={publishableKey}
      configApiHostname={configApiHostname}
    >
      <TesseralProviderInner requireLogin={requireLogin}>
        {children}
      </TesseralProviderInner>
    </PublishableKeyConfigProvider>
  );
}

function TesseralProviderInner({
  requireLogin,
  children,
}: {
  requireLogin: boolean;
  children?: React.ReactNode;
}) {
  const projectId = useProjectId();
  const vaultDomain = useVaultDomain();
  const accessToken = useAccessTokenInternal(requireLogin);
  const frontendApiClient = useFrontendApiClient();

  const parsedAccessToken = useMemo(() => {
    if (!accessToken) {
      return undefined;
    }
    return parseAccessToken(accessToken);
  }, [accessToken]);

  const contextValue = useMemo(() => {
    return {
      projectId,
      vaultDomain,
      accessToken,
      organization: parsedAccessToken?.organization,
      user: parsedAccessToken?.user,
      session: parsedAccessToken?.session,
      frontendApiClient,
    };
  }, [
    projectId,
    vaultDomain,
    accessToken,
    parsedAccessToken,
    frontendApiClient,
  ]);

  return (
    <TesseralContext.Provider value={contextValue}>
      {children}
    </TesseralContext.Provider>
  );
}

import React, { useMemo } from "react";

import { parseAccessToken } from "./parse-access-token";
import {
  PublishableKeyConfigProvider,
  useDevMode,
  useProjectId,
  useVaultDomain,
} from "./publishable-key-config";
import { TesseralContext } from "./tesseral-context";
import { useAccessTokenDefaultMode } from "./use-access-token-default-mode";
import { useAccessTokenDevMode } from "./use-access-token-dev-mode";
import { useFrontendApiClient } from "./use-frontend-api-client";

interface TesseralProviderProps {
  publishableKey: string;
  requireLogin?: boolean;
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
  const frontendApiClient = useFrontendApiClient();

  const devMode = useDevMode();

  const devModeAccessToken = useAccessTokenDevMode({
    requireLogin,
    enabled: devMode,
  });
  const defaultModeAccessToken = useAccessTokenDefaultMode({
    requireLogin,
    enabled: !devMode,
  });

  const accessToken = devMode ? devModeAccessToken : defaultModeAccessToken;

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

  if (requireLogin && !accessToken) {
    // We're waiting to hear back on the results of the access token; the
    // enabled access token hook will handle doing background requests or
    // redirects as required.
    return null;
  }

  return (
    <TesseralContext.Provider value={contextValue}>
      {children}
    </TesseralContext.Provider>
  );
}

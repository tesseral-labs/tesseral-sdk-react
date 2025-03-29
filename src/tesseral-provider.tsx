import React, { useContext, useMemo } from "react";

import { DefaultModeAccessTokenProvider } from "./default-mode-access-token-provider";
import { DevModeAccessTokenProvider } from "./dev-mode-access-token-provider";
import { InternalAccessTokenContext } from "./internal-access-token-context";
import { parseAccessToken } from "./parse-access-token";
import { PublishableKeyConfigProvider, useDevMode, useProjectId, useVaultDomain } from "./publishable-key-config";
import { TesseralContext } from "./tesseral-context";

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
    <PublishableKeyConfigProvider publishableKey={publishableKey} configApiHostname={configApiHostname}>
      <TesseralProviderWithConfig>
        <TesseralProviderWithAccessToken>{children}</TesseralProviderWithAccessToken>
      </TesseralProviderWithConfig>
    </PublishableKeyConfigProvider>
  );
}

function TesseralProviderWithConfig({ children }: { children?: React.ReactNode }) {
  const devMode = useDevMode();

  if (devMode) {
    return <DevModeAccessTokenProvider>{children}</DevModeAccessTokenProvider>;
  } else {
    return <DefaultModeAccessTokenProvider>{children}</DefaultModeAccessTokenProvider>;
  }
}

function TesseralProviderWithAccessToken({ children }: { children?: React.ReactNode }) {
  const projectId = useProjectId();
  const vaultDomain = useVaultDomain();

  const { accessToken, frontendApiClient } = useContext(InternalAccessTokenContext)!;
  const parsedAccessToken = useMemo(() => {
    return parseAccessToken(accessToken);
  }, [accessToken]);

  const contextValue = useMemo(() => {
    return {
      projectId,
      vaultDomain,
      accessToken,
      organization: parsedAccessToken.organization!,
      user: parsedAccessToken.user!,
      session: parsedAccessToken.session!,
      frontendApiClient,
    };
  }, [projectId, vaultDomain, accessToken, parsedAccessToken, frontendApiClient]);

  return <TesseralContext.Provider value={contextValue}>{children}</TesseralContext.Provider>;
}

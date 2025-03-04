import React, { createContext, useContext } from "react";
import { useFetch } from "./use-fetch";

interface PublishableKeyConfig {
  projectId: string;
  vaultDomain: string;
}

const PublishableKeyConfigContext = createContext<
  PublishableKeyConfig | undefined
>(undefined);

export interface PublishableKeyConfigProviderProps {
  publishableKey: string;
  configApiHostname: string;
  children?: React.ReactNode;
}

export function PublishableKeyConfigProvider({
  publishableKey,
  configApiHostname,
  children,
}: PublishableKeyConfigProviderProps) {
  const { data } = useFetch<PublishableKeyConfig>(
    `https://${configApiHostname}/v1/config/${publishableKey}`,
  );
  if (!data) {
    return null;
  }

  return (
    <PublishableKeyConfigContext.Provider value={data}>
      {children}
    </PublishableKeyConfigContext.Provider>
  );
}

export function useProjectId(): string {
  const config = useContext(PublishableKeyConfigContext);
  if (!config) {
    throw new Error(
      "useProjectId() must be called from a child component of PublishableKeyConfigContext",
    );
  }
  return config.projectId;
}

export function useVaultDomain(): string {
  const config = useContext(PublishableKeyConfigContext);
  if (!config) {
    throw new Error(
      "useVaultDomain() must be called from a child component of PublishableKeyConfigContext",
    );
  }
  return config.vaultDomain;
}

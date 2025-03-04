import { useVaultDomain } from "./publishable-key-config";
import { TesseralClient } from "@tesseral/tesseral-vanilla-clientside";
import { useMemo } from "react";

export function useFrontendApiClient() {
  const vaultDomain = useVaultDomain();

  return useMemo(() => {
    return new TesseralClient({
      environment: `https://${vaultDomain}`,
    });
  }, [vaultDomain]);
}

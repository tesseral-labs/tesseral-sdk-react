import { TesseralClient } from "@tesseral/tesseral-vanilla-clientside";
import { useMemo } from "react";

import { useVaultDomain } from "./publishable-key-config";

export function useFrontendApiClientInternal() {
  const vaultDomain = useVaultDomain();

  return useMemo(() => {
    return new TesseralClient({
      environment: `https://${vaultDomain}/api`,
    });
  }, [vaultDomain]);
}

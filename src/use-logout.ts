import { useDevMode } from "./publishable-key-config";
import { useDefaultModeLogout } from "./use-default-mode-logout";
import { useDevModeLogout } from "./use-dev-mode-logout";

export function useLogout(): () => void {
  const devMode = useDevMode();
  const defaultModeLogout = useDefaultModeLogout();
  const devModeLogout = useDevModeLogout();
  return devMode ? devModeLogout : defaultModeLogout;
}

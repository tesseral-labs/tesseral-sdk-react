import { TesseralClient } from "@tesseral/tesseral-vanilla-clientside";
import {
  AccessTokenOrganization,
  AccessTokenSession,
  AccessTokenUser,
} from "@tesseral/tesseral-vanilla-clientside/api";
import { useCallback, useContext } from "react";

import { deleteCookie } from "./cookie";
import { useProjectId } from "./publishable-key-config";
import { TesseralContext } from "./tesseral-context";
import { useAccessTokenLocalStorage } from "./use-access-token-localstorage";
import { useRefreshTokenLocalStorage } from "./use-refresh-token-localstorage";

export interface UseTesseralResult {
  vaultDomain: string;
  frontendApiClient: TesseralClient;
  accessToken: string;
  organization: AccessTokenOrganization;
  user: AccessTokenUser;
  session: AccessTokenSession;
}

export function useTesseral(): UseTesseralResult {
  const context = useContext(TesseralContext);
  if (!context) {
    throw new Error("useTesseral() must be called from a child component of TesseralContext");
  }
  return {
    vaultDomain: context.vaultDomain,
    frontendApiClient: context.frontendApiClient,
    accessToken: context.accessToken,
    session: context.session,
    user: context.user,
    organization: context.organization,
  };
}

export function useAccessToken(): string {
  const accessToken = useContext(TesseralContext)?.accessToken;
  if (!accessToken) {
    throw new Error(`useAccessToken() must be called from a child component of TesseralContext`);
  }
  return accessToken;
}

export function useOrganization(): AccessTokenOrganization {
  const organization = useContext(TesseralContext)?.organization;
  if (!organization) {
    throw new Error(`useOrganization() must be called from a child component of TesseralContext`);
  }
  return organization;
}

export function useUser(): AccessTokenUser {
  const user = useContext(TesseralContext)?.user;
  if (!user) {
    throw new Error(`useUser() must be called from a child component of TesseralContext`);
  }
  return user;
}

export function useHasPermission(): (action: string) => boolean {
  const actions = useContext(TesseralContext)?.actions;
  if (!actions) {
    throw new Error(`useHasPermission() must be called from a child component of TesseralContext`);
  }

  return useCallback(
    (action: string) => {
      return actions.includes(action);
    },
    [actions],
  );
}

export function useLogout(): () => void {
  // this code may call a variable number of hooks, but we're throwing in such
  // cases anyway
  if (!useContext(TesseralContext)) {
    throw new Error(`useLogout() must be called from a child component of TesseralContext`);
  }

  const { frontendApiClient } = useTesseral();
  const [, setRefreshTokenLocalStorage] = useRefreshTokenLocalStorage();
  const [, setAccessTokenLocalStorage] = useAccessTokenLocalStorage();
  const projectId = useProjectId();

  return useCallback(() => {
    async function logout() {
      // clear out any dev mode localstorage state; no-op in default mode
      setRefreshTokenLocalStorage(null);
      setAccessTokenLocalStorage(null);
      deleteCookie(`tesseral_${projectId}_access_token`);

      await frontendApiClient.logout({});
    }

    void logout();
  }, [frontendApiClient, projectId, setAccessTokenLocalStorage, setRefreshTokenLocalStorage]);
}

export function useOrganizationSettingsUrl(): string {
  if (!useContext(TesseralContext)) {
    throw new Error(`useOrganizationSettingsUrl() must be called from a child component of TesseralContext`);
  }

  const { vaultDomain } = useTesseral();
  return `https://${vaultDomain}/organization-settings`;
}

export function useUserSettingsUrl(): string {
  if (!useContext(TesseralContext)) {
    throw new Error(`useUserSettingsUrl() must be called from a child component of TesseralContext`);
  }

  const { vaultDomain } = useTesseral();
  return `https://${vaultDomain}/user-settings`;
}

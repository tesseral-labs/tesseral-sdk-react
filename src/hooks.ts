import { TesseralClient } from "@tesseral/tesseral-vanilla-clientside";
import {
  AccessTokenOrganization,
  AccessTokenSession,
  AccessTokenUser,
} from "@tesseral/tesseral-vanilla-clientside/api";
import { useContext } from "react";

import { TesseralContext } from "./tesseral-context";

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

export function useOrganizationSettingsUrl(): string {
  const { vaultDomain } = useTesseral();
  return `https://${vaultDomain}/organization-settings`;
}

export function useUserSettingsUrl(): string {
  const { vaultDomain } = useTesseral();
  return `https://${vaultDomain}/user-settings`;
}

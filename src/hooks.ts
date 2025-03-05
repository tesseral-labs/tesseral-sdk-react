import {
  AccessTokenOrganization,
  AccessTokenSession,
  AccessTokenUser,
} from "@tesseral/tesseral-vanilla-clientside/api";
import { useContext } from "react";
import { TesseralContext } from "./tesseral-context";
import { TesseralClient } from "@tesseral/tesseral-vanilla-clientside";

export interface UseTesseralResult {
  vaultDomain: string;
  frontendApiClient: TesseralClient;
  accessToken?: string;
  organization?: AccessTokenOrganization;
  user?: AccessTokenUser;
  session?: AccessTokenSession;
}

export function useTesseral(): UseTesseralResult {
  const context = useContext(TesseralContext);
  if (!context) {
    throw new Error(
      "useTesseral() must be called from a child component of TesseralContext",
    );
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

export function useMaybeAccessToken(): string | undefined {
  return useTesseral().accessToken;
}

export function useMaybeOrganization(): AccessTokenOrganization | undefined {
  return useTesseral().organization;
}

export function useMaybeUser(): AccessTokenUser | undefined {
  return useTesseral().user;
}

export function useAccessToken(): string {
  const accessToken = useMaybeAccessToken();
  if (!accessToken) {
    throw new Error(
      `useAccessToken() must be called from a child component of TesseralContext with "requireLogin" set to true`,
    );
  }
  return accessToken;
}

export function useOrganization(): AccessTokenOrganization {
  const organization = useMaybeOrganization();
  if (!organization) {
    throw new Error(
      `useOrganization() must be called from a child component of TesseralContext with "requireLogin" set to true`,
    );
  }
  return organization;
}

export function useUser(): AccessTokenUser {
  const user = useMaybeUser();
  if (!user) {
    throw new Error(
      `useUser() must be called from a child component of TesseralContext with "requireLogin" set to true`,
    );
  }
  return user;
}

export function useSignupUrl(): string {
  const { vaultDomain } = useTesseral();
  return `https://${vaultDomain}/signup`;
}

export function useLoginUrl(): string {
  const { vaultDomain } = useTesseral();
  return `https://${vaultDomain}/login`;
}

export function useOrganizationSettingsUrl(): string {
  const { vaultDomain } = useTesseral();
  return `https://${vaultDomain}/organization-settings`;
}

export function useUserSettingsUrl(): string {
  const { vaultDomain } = useTesseral();
  return `https://${vaultDomain}/user-settings`;
}

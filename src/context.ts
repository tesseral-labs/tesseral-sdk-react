import { createContext, useContext } from "react";

export interface TesseralContextValue {
  projectId: string;
  vaultDomain: string;
  accessToken: string;
  session: {
    id: string;
  };
  user: {
    id: string;
    organizationId: string;
    email: string;
  };
  organization: {
    id: string;
    displayName: string;
  };
}

export const TesseralContext = createContext<TesseralContextValue | undefined>(
  undefined,
);

export function useOrganization() {
  const context = useContext(TesseralContext);
  if (!context) {
    throw new Error(
      "useOrganization() must be called from a child component of TesseralContext",
    );
  }
  return context.organization;
}

export function useUser() {
  const context = useContext(TesseralContext);
  if (!context) {
    throw new Error(
      "useUser() must be called from a child component of TesseralContext",
    );
  }
  return context.user;
}

export function useAccessToken(): string {
  const context = useContext(TesseralContext);
  if (!context) {
    throw new Error(
      "useAccessToken() must be called from a child component of TesseralContext",
    );
  }
  return context.accessToken;
}

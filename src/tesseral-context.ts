import { createContext, useContext } from "react";
import {
  AccessTokenOrganization,
  AccessTokenSession,
  AccessTokenUser,
} from "@tesseral/tesseral-vanilla-clientside/api";
import { TesseralClient } from "@tesseral/tesseral-vanilla-clientside";

export interface TesseralContextValue {
  projectId: string;
  vaultDomain: string;
  accessToken?: string;
  organization?: AccessTokenOrganization;
  user?: AccessTokenUser;
  session?: AccessTokenSession;
  frontendApiClient: TesseralClient;
}

export const TesseralContext = createContext<TesseralContextValue | undefined>(
  undefined,
);

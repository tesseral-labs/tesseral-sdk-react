import { TesseralClient } from "@tesseral/tesseral-vanilla-clientside";
import { createContext } from "react";

export interface InternalAccessTokenContextValue {
  accessToken: string;
  frontendApiClient: TesseralClient;
}

export const InternalAccessTokenContext = createContext<InternalAccessTokenContextValue | undefined>(undefined);

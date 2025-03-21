import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import {
  TesseralProvider,
  useAccessToken,
  useLogout,
  useOrganization,
  useOrganizationSettingsUrl,
  useUser,
  useUserSettingsUrl,
} from "../../index";

function App() {
  const user = useUser();
  const organization = useOrganization();
  const accessToken = useAccessToken();
  const userSettingsUrl = useUserSettingsUrl();
  const organizationSettingsUrl = useOrganizationSettingsUrl();
  const logout = useLogout();

  return (
    <div>
      <h1>Hello, {user.email}!</h1>
      <a href={userSettingsUrl}>User Settings</a>
      <div>Organization: {organization.displayName}</div>
      <a href={organizationSettingsUrl}>Organization Settings</a>
      <pre>{accessToken}</pre>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

const root = createRoot(document.getElementById("react-root") as HTMLElement);
root.render(
  <TesseralProvider
    publishableKey="publishable_key_1sd75fpowmox764gfwrrxeehn"
    configApiHostname="config.tesseral.example.com"
  >
    <App />
  </TesseralProvider>,
);

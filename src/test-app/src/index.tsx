import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  TesseralProvider,
  useAccessToken,
  useLogout,
  useOrganization,
  useOrganizationSettingsUrl,
  useTesseral,
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
  const { frontendApiClient } = useTesseral();

  const [data, setData] = useState<unknown>();
  useEffect(() => {
    (async () => {
      setData(await frontendApiClient.me.whoami({}));
    })();
  }, [frontendApiClient.me]);

  return (
    <div>
      <h1>Hello, {user.email}!</h1>
      <a href={userSettingsUrl}>User Settings</a>
      <div>Organization: {organization.displayName}</div>
      <a href={organizationSettingsUrl}>Organization Settings</a>
      <pre>{accessToken}</pre>
      <button onClick={() => logout()}>logout</button>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

const root = createRoot(document.getElementById("react-root") as HTMLElement);
root.render(
  <StrictMode>
    <TesseralProvider publishableKey="publishable_key_6kdiksy1lnq9hi1bh4s83nu3c">
      <App />
    </TesseralProvider>
  </StrictMode>,
);

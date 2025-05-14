import React, { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  TesseralProvider,
  useAccessToken,
  useHasPermission,
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
  const hasPermission = useHasPermission();
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
      <div>Has permission to `acme.widgets.edit`? {JSON.stringify(hasPermission("acme.widgets.edit"))}</div>
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
    <TesseralProvider publishableKey="publishable_key_7nvw48k6r4wazcpna9stb8tid">
      <App />
    </TesseralProvider>
  </StrictMode>,
);

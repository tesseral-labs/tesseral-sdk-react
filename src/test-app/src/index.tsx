import React from "react";
import { createRoot } from "react-dom/client";

import {
  TesseralProvider,
  useLogout,
  useMaybeAccessToken,
  useMaybeOrganization,
  useMaybeUser,
} from "../../index";

function App() {
  const user = useMaybeUser();
  const organization = useMaybeOrganization();
  const accessToken = useMaybeAccessToken();
  const logout = useLogout();

  return (
    <div>
      <h1>Hello, {user?.email}!</h1>
      <div>Organization: {organization?.displayName}</div>
      <pre>{accessToken}</pre>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

const root = createRoot(document.getElementById("react-root") as HTMLElement);
root.render(
  <TesseralProvider
    publishableKey="publishable_key_2qneh27d2po1yp5mrfpajxa57"
    configApiHostname="config.tesseral.example.com"
    requireLogin={true}
  >
    <App />
  </TesseralProvider>,
);
